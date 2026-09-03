---
title: "ros2_control 核心框架（二）：核心概念 Concepts"
published: 2026-08-31
description: "ros2_control 核心概念中文翻译：控制器级联/串级控制、关节运动学、关节限位、异步更新支持与 Controller Manager 使用的不同时钟。"
image: ""
tags: ["ROS2", "机器人", "ros2_control", "翻译"]
category: ROS2专题
slug: ros2-control-concepts
series: "ROS2-Control 官方文档中文翻译"
seriesOrder: 2
draft: false
lang: "zh-CN"
---

> **原文地址**：<https://control.ros.org/jazzy/doc/ros2_control/doc/index.html>
> **原文版本**：ROS 2 Jazzy（较旧但仍受支持的版本，最新版见 Kilted）
> **翻译说明**：本文为《ros2_control 核心框架官方文档（Jazzy 版）中文翻译》系列分篇，覆盖「Concepts（概念）」。为保证可读性与准确性：正文与说明性文字译为中文；代码、命令、参数名、消息类型、ROS 标识符等保留原文；关键术语在首次出现时标注英文原文。
> **原文档仓库**：<https://github.com/ros-controls/ros2_control>

# 2. Concepts（概念）

> 原文：<https://control.ros.org/jazzy/doc/ros2_control/doc/concepts.html>

---

## 2.1 Controller Chaining / Cascade Control（控制器级联/串级控制）

> 原文：<https://control.ros.org/jazzy/doc/ros2_control/controller_manager/doc/controller_chaining.html>

本文档提出了一种串行控制器级联（serial controller chaining）的最小可行实现（minimal-viable-implementation），其背景见 "Chaining Controllers" 设计文档。串级控制（Cascade control）是控制器级联的一种特定类型。

### 2.1.1 文档范围与背景知识

本方法只关注控制器的串行级联，并尽量复用现有机制。它聚焦于控制器的输入与输出及其在控制器管理器中的管理。引入控制器组（controller groups）的概念仅仅是为了表述清晰，其唯一含义是：该组内的控制器可以按任意顺序更新。这并不意味着控制器级联文档中描述的控制器组将来不会被引入和使用。不过，作者认为在现阶段引入控制器组只会增加不必要的复杂度，尽管从长远来看它们 _可能_ 能提供更清晰的结构和接口。

### 2.1.2 动机、目的与用途

为描述本文档的意图，我们聚焦于 'controllers_chaining' 设计文档中简单但足够的示例（Example 2）：
![控制器级联示例 2](https://lux2026.oss-cn-hangzhou.aliyuncs.com/images/ros2_control/chaining/chaining_example2.png)


在该示例中，我们希望将 'position_tracking' 控制器与 'diff_drive_controller'、两个 PID 控制器以及 'robot_localization' 控制器级联。现在设想一个用例：我们不仅希望将这些控制器作为一个组运行，还希望灵活地添加前置步骤。这意味着以下几点：

1. 机器人启动时，我们希望检查电机速度控制是否正常工作，因此只激活 PID 控制器。在此阶段，我们还可以通过话题在外部控制 PID 控制器的输入。不过，这些控制器也提供虚拟接口，因此我们可以对它们进行级联。
2. 然后激活 "diff_drive_controller"，它会挂接到 PID 控制器的虚拟输入接口上。PID 控制器也会被告知它们正工作在级联模式，因此会通过订阅者禁用其外部接口。此时我们检查差速机器人的运动学是否正常运行。
3. 一旦 'diff_drive_controller' 激活，它会暴露 'odom' 状态接口，该接口被 'odom_publisher' 和 'sensor_fusion' 控制器使用。'odom_publisher' 控制器被激活并挂接到 'diff_drive_controller' 导出的 'odom' 状态接口上。'sensor_fusion' 控制器被激活并挂接到 'diff_drive_controller' 导出的 'odom' 状态接口以及 'imu' 状态接口上。
4. 一旦 'sensor_fusion' 控制器激活，它会暴露 'odom' 状态接口，该接口被 'robot_localization' 控制器使用。'robot_localization' 控制器被激活并挂接到 'sensor_fusion' 控制器的 'odom' 状态接口上。激活后，'robot_localization' 控制器暴露 'actual_pose' 状态接口，该接口被 'position_tracking' 控制器使用。
5. 之后，"position_tracking" 可以被激活并挂接到 "diff_drive_controller"（后者会禁用其外部接口）以及提供 'actual_pose' 状态接口的 'robot_localization' 控制器上。
6. 如果任何一个控制器被停用，其所有前置控制器也需要被停用。

> **注意**
>
> 只有当暴露参考接口的控制器其参考接口被其他控制器使用时，这些控制器才切换到级联模式。当其参考接口未被其他控制器使用时，它们会切换回来从订阅者获取参考值。但是，暴露状态接口的控制器在其状态接口被其他控制器使用时，不会被触发进入级联模式。

> **注意**
>
> 本文档使用了 _前置_（preceding）和 _后置_（following）控制器的术语。这两个术语指代如下顺序关系：如果控制器 A 认领（_将其输出连接到_）B 的参考接口（_输入_），则称 A _前置_ 于 B。在本节开头的示例图中，'diff_drive_controller' _前置_ 于 'pid left wheel' 和 'pid right wheel'。相应地，'pid left wheel' 和 'pid right wheel' 是 _后置_ 于 'diff_drive_controller' 的控制器。

### 2.1.3 实现

#### 控制器基类：ChainableController

`ChainableController` 在 `ControllerInterface` 类的基础上扩展了 `virtual std::vector<hardware_interface::CommandInterface> export_reference_interfaces() = 0` 方法以及 `virtual std::vector<hardware_interface::StateInterface> export_state_interfaces() = 0` 方法。每个**可以被**其他控制器前置（即导出所有参考/状态接口）的控制器都应实现这些方法。为简单起见，目前假设控制器的所有参考接口都被其他控制器使用。然而，控制器导出的状态接口可以同时被多个控制器以任意组合使用。因此，不要试图实现参考接口的排他性组合；如果你需要排他性，请编写多个控制器。

`ChainableController` 基类实现了 `void set_chained_mode(bool activate)`，它设置一个内部标志，表示该控制器被另一个控制器使用（处于级联模式），并调用 `virtual void on_set_chained_mode(bool activate) = 0`，后者实现控制器在级联模式激活或停用时的特定动作，例如停用订阅者。

作为示例，PID 控制器导出一个虚拟接口 `pid_reference`，并在级联模式下停止其订阅者 `<controller_name>/pid_reference`。'diff_drive_controller' 控制器导出虚拟接口列表 `<controller_name>/v_x`、`<controller_name>/v_y` 和 `<controller_name>/w_z`，并停止来自话题 `<controller_name>/cmd_vel` 和 `<controller_name>/cmd_vel_unstamped` 的订阅。其发布者可以继续运行。

#### 术语（Nomenclature）

在 `ros2_control` 的语境中有两类接口：`CommandInterface` 和 `StateInterface`。

- `CommandInterface` 是一种读-写（Read-Write）类型的接口，可用于获取和设置数值。其典型用途是向硬件设置命令值。
- `StateInterface` 是一种只读（Read-Only）类型的接口，可用于获取数值。其典型用途是从硬件获取实际状态值。

这些接口在控制器内的不同位置被使用，以构成一个能够控制硬件的可用控制器或控制器链。

- `ControllerInterface` 类中定义的 `virtual InterfaceConfiguration command_interface_configuration() const` 方法用于定义控制器使用的命令接口。这些接口用于控制硬件或来自其他控制器导出的参考接口。`controller_manager` 使用该配置从 `ResourceManager` 认领命令接口。
- `ControllerInterface` 类中定义的 `virtual InterfaceConfiguration state_interface_configuration() const` 方法用于定义控制器使用的状态接口。这些接口用于从硬件或其他控制器导出的状态接口获取实际状态值。`controller_manager` 使用该配置从 `ResourceManager` 认领状态接口。
- `ChainableController` 类中定义的 `std::vector<hardware_interface::CommandInterface> export_reference_interfaces()` 方法用于定义控制器导出的参考接口。这些接口被其他控制器用于向该控制器下发命令。
- `ChainableController` 类中定义的 `std::vector<hardware_interface::StateInterface> export_state_interfaces()` 方法用于定义控制器导出的状态接口。这些接口被其他控制器用于从该控制器获取实际状态值。

#### 内部资源管理

配置一个可链式控制器后，控制器管理器会调用 `export_reference_interfaces` 和 `export_state_interfaces` 方法，并接管控制器导出的参考/状态接口的所有权。这与 `ResourceManager` 处理硬件接口的过程相同。控制器管理器会在一个向量中维护接口的 "claimed"（已认领）状态（与 `ResourceManager` 中的做法一致）。

#### 链式控制器的激活与停用

链式控制器必须一起激活和停用，或按正确顺序激活和停用。这意味着必须先激活所有后置控制器，才能激活前置控制器。停用则遵循相反的规则——必须先停用所有前置控制器，再停用后置控制器。也可以把它想象成一条真实的链条：你不能在链条中间添加或断开一个链环。链式控制器也可以通过控制器管理器提供的 `switch_controllers` 服务中的 `activate_controllers` 或 `deactivate_controllers` 字段以单个列表的形式一次性解析并激活。控制器管理器的 `spawner` 也可以通过传入 `--activate-as-group` 参数，在一次调用中激活整条链上的所有控制器。

### 2.1.4 调试输出

- 当导出参考接口的控制器处于非活动（inactive）状态时，这些参考接口为 `unavailable`（不可用）且 `unclaimed`（未认领）。
- 当导出参考接口的控制器处于活动（active）状态但未与任何其他控制器处于级联模式时，这些参考接口为 `available`（可用）且 `unclaimed`（未认领）（此时控制器从订阅者获取其参考值）。
- 当导出参考接口的控制器处于活动状态且与其他控制器处于级联模式时，这些参考接口为 `available`（可用）且 `claimed`（已认领）（此时控制器从与其级联的控制器获取参考值）。

### 2.1.5 结语

- 或许没有必要新增 `ChainableController` 控制器类型。也可以考虑在 `ControllerInterface` 类中直接实现 `export_reference_interfaces()` 和 `export_state_interfaces()` 方法，默认返回 `interface_configuration_type::NONE`。

---

## 2.2 Joint Kinematics（关节运动学）

> 原文：<https://control.ros.org/jazzy/doc/ros2_control/hardware_interface/doc/joints_userdoc.html>

本页旨在概述 ros2_control 语境下的关节运动学，对这个主题做简要介绍，并解释 ros2_control 中的当前实现。

### 2.2.1 术语

**自由度（Degrees of Freedom, DoF）**

来自维基百科：

> 在物理学中，机械系统的自由度（DoF）是定义其构型或状态所需的独立参数数量。

**关节（Joint）**

关节是两个连杆之间的连接。在 ROS 生态中，三种类型较为典型：转动副（Revolute，带位置限位的铰链）、连续副（Continuous，没有任何位置限位的连续铰链）或移动副（Prismatic，沿轴线滑动的关节）。

一般来说，关节可以是驱动的（actuated）或非驱动的（non-actuated），后者也称为被动（passive）。被动关节没有自己的驱动机构，而是通过外力或被其他关节被动带动来实现运动。被动关节可以具有一个 DoF（如单摆），也可以是零 DoF 的并联机构的一部分。

**串联运动学（Serial Kinematics）**

串联运动学指的是机械臂中关节的排列方式：每个关节彼此独立，关节数量等于运动链的自由度。

一个典型例子是具有六个转动关节、6 自由度的工业机器人。每个关节可以独立驱动，末端执行器可以在工作空间内移动到任意位置和姿态。

**运动学回路（Kinematic Loops）**

另一方面，运动学回路（也称为闭链机构）涉及多个关节在一条运动链中连接并一起驱动。这意味着这些关节是耦合的，不能独立移动：一般来说，自由度数小于关节数。这种结构是并联机构的典型特征，其末端执行器通过多条运动链连接到基座。

一个例子是四连杆机构（four-bar linkage），由四个连杆和四个关节组成。尽管有四个关节，它可以有一个或两个驱动器，因而具有一个或两个自由度。此外，我们可以说它有一个（两个）驱动关节和三个（两个）被动关节，它们必须满足机构的运动学约束。

### 2.2.2 URDF

URDF 是 ROS 中描述机器人运动学的默认格式。然而，除所谓的 mimic（模仿）关节外，URDF 只支持串联运动链。更多细节参见 URDF 规范。

Mimic 关节可以在 URDF 中以如下方式定义：

```xml
<joint name="right_finger_joint" type="prismatic">
  <axis xyz="0 1 0"/>
  <origin xyz="0.0 -0.48 1" rpy="0.0 0.0 0.0"/>
  <parent link="base"/>
  <child link="finger_right"/>
  <limit effort="1000.0" lower="0" upper="0.38" velocity="10"/>
</joint>
<joint name="left_finger_joint" type="prismatic">
  <mimic joint="right_finger_joint" multiplier="1" offset="0"/>
  <axis xyz="0 1 0"/>
  <origin xyz="0.0 0.48 1" rpy="0.0 0.0 3.1415926535"/>
  <parent link="base"/>
  <child link="finger_left"/>
  <limit effort="1000.0" lower="0" upper="0.38" velocity="10"/>
</joint>
```

Mimic 关节是真实世界的抽象。例如，它们可用于描述：

- 关节位置与速度呈线性相关的简单闭链运动学
- 通过皮带连接的连杆，如皮带-带轮系统或伸缩臂
- 被动关节的简化模型，例如末端执行器上始终指向下方的单摆
- 抽象的运动关节复合组，其中多个关节由底层控制回路直接控制并同步运动。举个不涉及真实世界的例子：多个电机拥有各自的功率电子器件，但接收同一个设定值指令。

URDF 中定义的 mimic 关节由资源管理器（resource manager）解析，并存储在类型为 `HardwareInfo` 的类变量中，硬件组件可以访问该变量。Mimic 关节不能有命令接口，但可以有状态接口。

```xml
<ros2_control>
  <joint name="right_finger_joint">
    <command_interface name="effort"/>
    <state_interface name="position"/>
    <state_interface name="velocity"/>
    <state_interface name="effort"/>
  </joint>
  <joint name="left_finger_joint">
    <state_interface name="position"/>
    <state_interface name="velocity"/>
    <state_interface name="effort"/>
  </joint>
</ros2_control>
```

在官方发布的包中，以下包已经在使用这些信息：

- mock_components（generic system）
- gz_ros2_control

由于 URDF 只规定运动学，mimic 标签必须独立于 ros2_control 中使用的硬件接口类型。这意味着我们按如下方式解释这些信息：

- **position = multiplier * other_joint_position + offset**
- **velocity = multiplier * other_joint_velocity**

如果有人出于任何原因想在不修改 URDF 的情况下停用 mimic 关节行为，可以通过在 XML 的 `<ros2_control>` 部分设置关节标签的 `mimic=false` 属性来实现：

```xml
<joint name="left_finger_joint" mimic="false">
  <state_interface name="position"/>
  <state_interface name="velocity"/>
  <state_interface name="effort"/>
</joint>
```

### 2.2.3 传动接口（Transmission Interface）

机械传动会对力/流（effort/flow）变量进行变换，使其乘积（功率）保持不变。线性和旋转域的力变量分别为力和力矩；流变量则分别为线速度和角速度。

在机器人学中，习惯将传动装置放置在驱动器和关节之间。该接口遵循这一命名习惯，以标识变换的输入和输出空间。所提供的接口支持在力、速度和位置的驱动器空间与关节空间之间进行双向映射。位置不是功率变量，但可以通过速度映射加上一个代表驱动器与关节零点之间偏移的积分常数来实现该映射。

`transmission_interface` 为插件提供基类和若干实现，插件可由自定义硬件组件集成并加载。它们不会由任何硬件组件或 gazebo 插件自动加载；每个硬件组件负责加载适当的传动接口，以将驱动器读数映射为关节读数。

目前可用的实现如下：

- `SimpleTransmission`：具有恒定减速比且无额外动力学的简单传动。
- `DifferentialTransmission`：具有两个驱动器和两个关节的差速传动。
- `FourBarLinkageTransmission`：具有两个驱动器和两个关节的四连杆传动。

更多信息，参见 example_8 或 transmission_interface 文档。

### 2.2.4 仿真闭链运动学

根据不同的仿真插件，可以采用不同的方法来仿真闭链运动学。以下列表概述了可用的仿真插件及其能力：

**gazebo_ros2_control：**

- mimic 关节
- 通过在 URDF 中使用 `<gazebo>` 标签支持闭链运动学，参见相关示例。

**gz_ros2_control：**

- mimic 关节
- 尚不直接支持闭链运动学，但可以通过自定义插件使用 `DetachableJoint` 来实现。可关注该 issue 以获取此主题的更新。

## 2.3 Joint Limiting（关节限位）

> 原文：<https://control.ros.org/jazzy/doc/ros2_control/hardware_interface/doc/joint_limiting.html>

ros2_control 提供了多种机制来处理不同硬件接口的关节限位。

### 2.3.1 启用关节限位

在 ros2_control 中有几种控制关节限位处理的方式：

- **全局**：通过 `ros2_control_node` 参数 `enforce_command_limits` 对所有硬件组件的所有接口全局启用，详见前文。
- **针对关节的所有接口**：

```xml
<joint name="joint1">
  ...
  <limits enable="false"/>
  ...
</joint>
```

- **针对关节的单个接口**：

```xml
<joint name="joint1">
  ...
  <command_interface name="position">
    <limits enable="false"/>
  </command_interface>
  ...
</joint>
```

如果某个特定接口启用了关节限位，controller_manager 会在启动时打印类似如下消息：

```
[controller_manager]: Using JointLimiter for joint 'joint1' in hardware 'RRBot' : '  has position limits: true [-1, 1]
[ros2_control_node-1]   has velocity limits: true [1]
[ros2_control_node-1]   has acceleration limits: false [nan]
[ros2_control_node-1]   has deceleration limits: false [nan]
[ros2_control_node-1]   has jerk limits: false [nan]
[ros2_control_node-1]   has effort limits: true [100]
[ros2_control_node-1]   angle wraparound: true'
```

### 2.3.2 限位的配置

待补充（tba）

### 2.3.3 限位器算法说明

待补充（tba）

---

## 2.4 Support for Asynchronous Updates（异步更新支持）

> 原文：<https://control.ros.org/jazzy/doc/ros2_control/controller_manager/doc/async_updates.html>

本节包含以下子主题：

- [异步控制器](#241-异步控制器asynchronous-controllers)
- [异步硬件组件](#242-异步硬件组件asynchronous-hardware-components)

### 2.4.1 异步控制器（Asynchronous Controllers）

> 原文：<https://control.ros.org/jazzy/doc/ros2_control/controller_manager/doc/running_controllers_asynchronously.html>

`ros2_control` 框架允许控制器异步运行。当控制器的 `update()` 方法包含阻塞调用或需要更长的执行时间而影响控制器管理器的控制循环周期时，异步运行非常有用；否则会影响控制循环的周期性并导致超时（overruns）。

例如，如果控制器管理器的 `update_rate` 为 100Hz，则所有控制器的 `update()` 调用与硬件组件的 `read()` 和 `write()` 调用的执行时间之和必须低于 10ms。如果某个控制器需要 15ms 的执行时间，那么它无法在同步模式下执行而不影响整体系统更新频率。异步运行这样的控制器，可以使其在专用线程上执行，而不阻塞主控制循环。

> **注意**
>
> 异步更新支持对每个控制器实现是透明的。任何现有控制器只需将 `is_async` 参数设为 `true` 即可异步运行。

#### 参数

可以在控制器的配置中设置以下参数来使其异步运行：

- `is_async`：（可选）若设为 `true`，控制器将异步运行其 `update()` 方法。默认值为 `false`。
- `update_rate`：（可选）触发控制器 `update()` 的频率（Hz）。若未设置或设为 `0`，控制器将与控制器管理器以相同的频率运行。

可以在 `async_parameters` 命名空间下设置额外的线程参数：

- `thread_priority`：（可选）运行控制器 `update()` 的线程的优先级。优先级为 0 到 99 之间的整数值。若未设置，线程继承与控制器管理器线程相同的优先级。
- `cpu_affinity`：（可选）将异步线程固定到的 CPU 核 ID 列表。默认为空列表，表示线程可以在任意 CPU 核上运行。

> **注意**
>
> 线程优先级仅在控制器异步运行时使用。异步控制器线程使用 FIFO 调度策略。

#### 示例

以下示例展示如何在 ROS 2 YAML 参数文件中配置异步控制器。控制器管理器以 100Hz 运行，异步控制器配置为以 20Hz 运行：

```yaml
controller_manager:
  ros__parameters:
    update_rate: 100  # Hz

example_async_controller:
  ros__parameters:
    type: example_controller/ExampleController
    is_async: true
    update_rate: 20  # Hz
```

这将导致控制器以 20Hz 被触发，而控制器管理器以 100Hz 运行。

可以使用 `async_parameters` 命名空间配置额外的线程参数：

```yaml
example_async_controller:
  ros__parameters:
    type: example_controller/ExampleController
    is_async: true
    update_rate: 20  # Hz
    async_parameters:
      thread_priority: 50
      cpu_affinity: [2, 4]
```

所有参数的说明可以在 `ros2_controllers` 文档的 "Common Controller Parameters"（公共控制器参数）部分找到。

#### 调度行为

从设计角度看，控制器管理器扮演着调度器的角色，在控制循环期间触发异步控制器的更新。

`ControllerInterfaceBase` 调用 `AsyncFunctionHandler` 来处理控制器实际的 `update()` 回调。`AsyncFunctionHandler` 属于 realtime_tools 包。这也是资源管理器（resource manager）用于支持异步硬件组件 `read()` 和 `write()` 操作的同一机制（参见 [异步硬件组件](#242-异步硬件组件asynchronous-hardware-components)）。当控制器被配置为异步运行时，控制器接口在控制器的配置阶段创建一个异步处理器（async handler），并将其绑定到控制器的 `update()` 方法。异步处理器线程以与控制器管理器相同的线程优先级或 `thread_priority` 参数指定的优先级创建。

当被控制器管理器触发时，异步处理器会检查上一次触发是否已完成，然后调用 `update()` 方法。如果下一次触发到来时上一次 `update()` 仍在运行，则会复用上一次的结果，并打印如下警告：

```
[ros2_control_node-1] [WARN] [1741626670.311533972] [example_async_controller]: The controller missed xx update cycles out of yy total triggers.
```

如果该警告频繁出现，则应降低控制器的 `update_rate`，因为计算耗时超过了配置周期所允许的时间。

如果异步控制器的 `update()` 方法抛出未处理的异常，控制器管理器会像处理同步控制器一样处理——停用该控制器。会打印类似如下的错误消息：

```
[ros2_control_node-1] [ERROR] [1741629098.352771957] [AsyncFunctionHandler]: AsyncFunctionHandler: Exception caught in the async callback thread!
...
[ros2_control_node-1] [ERROR] [1741629098.352874151] [controller_manager]: Caught exception of type : St13runtime_error while updating controller
[ros2_control_node-1] [ERROR] [1741629098.352940701] [controller_manager]: Deactivating controllers : [example_async_controller] as their update resulted in an error!
```

#### 相关主题

- 异步运行硬件组件 — [异步硬件组件](#242-异步硬件组件asynchronous-hardware-components)
- 以不同的更新频率运行硬件组件 — [不同的更新频率](#33-different-update-rates不同的更新频率)

### 2.4.2 异步硬件组件（Asynchronous Hardware Components）

> 原文：<https://control.ros.org/jazzy/doc/ros2_control/hardware_interface/doc/asynchronous_components.html>

`ros2_control` 框架允许异步运行硬件组件。当某些硬件组件需要在单独的线程或执行器中运行时非常有用。例如，某个传感器读取数据耗时较长，影响了 `controller_manager` 控制循环的周期性。这种情况下，可以让该传感器在单独的线程或执行器中运行，以避免阻塞控制循环。

#### 参数

可以在 `ros2_control` 硬件配置中设置以下参数来异步运行硬件组件：

- `is_async`：（可选）若设为 `true`，硬件组件将异步运行。默认值为 `false`。

在 `ros2_control` 标签下，可以添加一个 `properties` 标签来指定异步硬件组件的以下参数：

- `thread_priority`：（可选）运行硬件组件的线程的优先级。优先级为 0 到 99 之间的整数值。默认值为 50。
- `affinity`：（可选）运行硬件组件的线程的 CPU 亲和性。亲和性为 CPU 核 ID 列表。默认值为空列表，表示线程可以在任意 CPU 核上运行。
- `scheduling_policy`：（可选）运行硬件组件的线程的调度策略。可取以下值之一：
  - `synchronized`（默认）：线程与主 controller_manager 线程同步运行。controller_manager 负责触发硬件组件的 read 和 write 调用。
  - `detached`：线程独立于主 controller_manager 线程运行。硬件组件自行管理其 read 和 write 调用的触发时序。
- `print_warnings`：（可选）若设为 `true`，当线程无法满足其时序要求时会打印警告。默认值为 `true`。

> **注意**
>
> 线程优先级仅在硬件组件异步运行时使用。硬件组件异步运行时使用 FIFO 调度策略。

#### 示例

以下示例展示如何通过 `ros2_control` URDF 同步和异步地使用不同的硬件接口类型。它们可以在不同类型的硬件组件（system、actuator、sensor，详见文档）内组合使用，如下所示。

对于一个带多模态夹爪和外部传感器的 RRBot：

```xml
<ros2_control name="RRBotSystemMutipleGPIOs" type="system">
  <hardware>
    <plugin>ros2_control_demo_hardware/RRBotSystemPositionOnlyHardware</plugin>
    <param name="example_param_hw_start_duration_sec">2.0</param>
    <param name="example_param_hw_stop_duration_sec">3.0</param>
    <param name="example_param_hw_slowdown">2.0</param>
  </hardware>
  <joint name="joint1">
    <command_interface name="position">
      <param name="min">-1</param>
      <param name="max">1</param>
    </command_interface>
    <state_interface name="position"/>
  </joint>
  <joint name="joint2">
    <command_interface name="position">
      <param name="min">-1</param>
      <param name="max">1</param>
    </command_interface>
    <state_interface name="position"/>
  </joint>
  <gpio name="flange_digital_IOs">
    <command_interface name="digital_output1"/>
    <state_interface name="digital_output1"/>    <!-- Needed to know current state of the output -->
    <command_interface name="digital_output2"/>
    <state_interface name="digital_output2"/>
    <state_interface name="digital_input1"/>
    <state_interface name="digital_input2"/>
  </gpio>
</ros2_control>
<ros2_control name="MultimodalGripper" type="actuator" is_async="true">
  <properties>
    <async affinity="[2,4]" scheduling_policy="synchronized" print_warnings="true" thread_priority="30"/>
  </properties>
  <hardware>
    <plugin>ros2_control_demo_hardware/MultimodalGripper</plugin>
  </hardware>
  <joint name="parallel_fingers">
    <command_interface name="position">
      <param name="min">0</param>
      <param name="max">100</param>
    </command_interface>
    <state_interface name="position"/>
  </joint>
</ros2_control>
<ros2_control name="RRBotForceTorqueSensor2D" type="sensor" is_async="true">
  <hardware>
    <plugin>ros2_control_demo_hardware/ForceTorqueSensor2DHardware</plugin>
    <param name="example_param_read_for_sec">0.43</param>
  </hardware>
  <sensor name="tcp_fts_sensor">
    <state_interface name="fx"/>
    <state_interface name="tz"/>
    <param name="frame_id">kuka_tcp</param>
    <param name="fx_range">100</param>
    <param name="tz_range">100</param>
  </sensor>
  <sensor name="temp_feedback">
    <state_interface name="temperature"/>
  </sensor>
  <gpio name="calibration">
    <command_interface name="calibration_matrix_nr"/>
    <state_interface name="calibration_matrix_nr"/>
  </gpio>
</ros2_control>
```

在上面的示例中，定义了以下组件：

- 一个名为 `RRBotSystemMutipleGPIOs` 的 system 硬件组件，包含两个关节和一个 GPIO 组件，同步运行。
- 一个名为 `MultimodalGripper` 的 actuator 硬件组件，包含一个关节，以线程优先级 30 异步运行。
- 一个名为 `RRBotForceTorqueSensor2D` 的 sensor 硬件组件，包含两个传感器和一个 GPIO 组件，以默认线程优先级 50 异步运行。

---

## 2.5 Different Clocks used by Controller Manager（控制器管理器使用的不同时钟）

> 原文：<https://control.ros.org/jazzy/doc/ros2_control/controller_manager/doc/clocks.html>

对于非仿真环境，控制器管理器内部使用以下两种不同的时钟：

- `RCL_ROS_TIME`：此时钟主要在非实时循环中使用。
- `RCL_STEADY_TIME`：此时钟主要在 `read`、`update` 和 `write` 循环等实时循环中使用。然而，当控制器管理器在仿真环境中使用时，会使用 `RCL_ROS_TIME` 时钟来触发 `read`、`update` 和 `write` 循环。

硬件组件 `read` 和 `write` 方法中的 `time` 参数类型为 `RCL_STEADY_TIME`，因为大多数硬件期望时间是单调的，不受系统时间变化的影响。而控制器 `update` 方法中的 `time` 参数类型为 `RCL_ROS_TIME`，因为控制器是与其它节点或话题交互以接收命令或发布状态的组件。控制器可以使用这个 `time` 参数来校验收到的命令，或在正确的时间戳发布状态。`read`、`update` 和 `write` 方法中的 `period` 参数使用 `RCL_STEADY_TIME` 类型的触发时钟计算，因此始终是单调的。

使用不同时钟的原因是为了避免系统时间变化对实时循环产生的影响。`ros2_control_node` 现在也能检测由系统时间变化以及控制器和硬件组件执行时间过长引起的超时。如果控制器或硬件组件因系统时间变化或执行时间过长而错过更新周期，控制器管理器会打印警告消息。

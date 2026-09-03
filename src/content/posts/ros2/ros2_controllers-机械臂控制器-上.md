---
title: "ros2_controllers 官方文档（三）：机械臂及其他机器人控制器（上）"
published: 2026-08-31
description: "ros2_controllers 机械臂及其他机器人控制器中文翻译（上）：导纳控制器、力控制器、前馈命令控制器、夹爪控制器与 GPIO 命令控制器。"
image: ""
tags: ["ROS2", "机器人", "ros2_control", "翻译", "ros2_controllers", "控制器", "机械臂"]
category: ROS2专题
slug: ros2-controllers-manipulators-part-1
series: "ROS2-Control 官方文档中文翻译"
seriesOrder: 7
draft: false
lang: "zh-CN"
---

> **原文地址**：<https://control.ros.org/jazzy/doc/ros2_controllers/doc/controllers_index.html>
> **原文版本**：ROS 2 Jazzy（较旧但仍受支持的版本，最新版见 Kilted）
> **翻译说明**：本文为《ros2_controllers 官方文档（Jazzy 版）中文翻译》系列分篇，覆盖「导纳、力、前馈命令、夹爪与 GPIO 控制器」。正文与说明文字译为中文；代码、命令、参数名、消息类型、ROS 标识符、数学公式保留原文；关键术语在首次出现时标注英文原文。
> **原文档仓库**：<https://github.com/ros-controls/ros2_controllers>

# 4. 机械臂及其他机器人控制器（Controllers for Manipulators and Other Robots）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/doc/controllers_index.html>

这些控制器使用通用的硬件接口定义，并可能根据以下命令接口类型使用命名空间：

- `position_controllers`：`hardware_interface::HW_IF_POSITION`
- `velocity_controller`：`hardware_interface::HW_IF_VELOCITY`
- `effort_controllers`：`hardware_interface::HW_IF_ACCELERATION`
- `effort_controllers`：`hardware_interface::HW_IF_EFFORT`

## 4.1 导纳控制器（Admittance Controller）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/admittance_controller/doc/userdoc.html>

导纳控制器使您能够根据在 TCP（工具中心点）上测量的力实现零力控制（zero-force control）。该控制器实现了 `ChainedControllerInterface`，因此可以在其前面添加另一个控制器，例如 `JointTrajectoryController`。

控制器需要一个外部运动学插件（kinematics plugin）才能工作。kinematics_interface 仓库提供了一个接口和实现，导纳控制器可以使用它们。

### 4.1.1 控制器的 ROS 2 接口

#### 参数

导纳控制器使用 generate_parameter_library 来处理其参数。位于 src 文件夹中的参数定义文件包含控制器使用的所有参数的说明。

**`joints`** (string_array)

指定控制器将使用哪些关节。

- 只读：True

**`command_joints`** (string_array)

（可选）指定要写入另一个控制器参考值的关节。该参数仅当将此控制器的输出链接到另一个控制器的输入时相关。

- 只读：True
- 默认值：{}

**`command_interfaces`** (string_array)

指定控制器将声明哪些命令接口。

- 只读：True

**`state_interfaces`** (string_array)

指定控制器将声明哪些状态接口。

- 只读：True

**`chainable_command_interfaces`** (string_array)

指定控制器将导出的参考接口。通常使用 position 和 velocity。

- 只读：True
- 默认值：{"position", "velocity"}

**`kinematics.plugin_name`** (string)

指定要加载的运动学插件名称。

**`kinematics.plugin_package`** (string)

指定包含运动学插件的包名。

**`kinematics.base`** (string)

指定运动学插件使用的机器人描述中的基座连杆。

**`kinematics.tip`** (string)

指定运动学插件使用的机器人描述中的末端执行器连杆。

**`kinematics.alpha`** (double)

指定用于雅可比伪逆的阻尼系数。

- 默认值：0.01

**`ft_sensor.name`** (string)

指定将用于导纳计算的机器人描述中的力扭矩传感器名称。

**`ft_sensor.frame.id`** (string)

指定力扭矩传感器的帧/连杆名称。

**`ft_sensor.filter_coefficient`** (double)

指定传感器指数滤波器的滤波系数。

- 默认值：0.05

**`control.frame.id`** (string)

指定用于导纳计算的控制帧。

**`fixed_world_frame.frame.id`** (string)

指定用于导纳计算的世界帧。在此帧中重力必须向下。

**`gravity_compensation.frame.id`** (string)

指定定义重心（CoG）的帧。通常应使用力扭矩传感器帧。

**`gravity_compensation.CoG.pos`** (double_array)

指定末端执行器重心（CoG）在重力补偿帧中的位置。

- 约束：长度必须等于 3

**`gravity_compensation.CoG.force`** (double)

指定末端执行器的重量，例如质量 * 9.81。

- 默认值：0.0

**`admittance.selected_axes`** (bool_array)

指定 x、y、z、rx、ry、rz 轴是否应包含在导纳计算中。

- 约束：长度必须等于 6

**`admittance.mass`** (double_array)

指定用于导纳计算的 x、y、z、rx、ry、rz 的质量值。

- 约束：长度必须等于 6；数组中每个元素必须在 [0.0001, 1000000.0] 范围内

**`admittance.damping_ratio`** (double_array)

指定用于导纳计算的 x、y、z、rx、ry、rz 的阻尼比（damping ratio）值。阻尼比定义为：zeta = D / (2 * sqrt( M * S ))。

- 约束：长度必须等于 6

**`admittance.stiffness`** (double_array)

指定用于导纳计算的 x、y、z、rx、ry、rz 的刚度值。

- 约束：长度必须等于 6；数组中每个元素必须在 [0.0, 100000000.0] 范围内

**`admittance.joint_damping`** (double)

指定用于导纳计算的关节阻尼。

- 默认值：5.0
- 约束：大于或等于 0.0

**`enable_parameter_update_without_reactivation`** (bool)

如果启用，则控制器运行时会动态更新参数。

- 默认值：true

该控制器的一个示例参数文件可在 test 文件夹中找到：

```yaml
load_admittance_controller:
  # contains minimal parameters that need to be set to load controller
  ros__parameters:
    joints:
      - joint1
      - joint2

    command_interfaces:
      - velocity

    state_interfaces:
      - position
      - velocity

    chainable_command_interfaces:
      - position
      - velocity

    kinematics:
      plugin_name: kinematics_interface_kdl/KinematicsInterfaceKDL
      plugin_package: kinematics_interface
      base: base_link # Assumed to be stationary
      tip: tool0
      group_name: arm
      alpha: 0.0005

    ft_sensor:
      name: ft_sensor_name
      frame:
        id: link_6 # tool0 Wrench measurements are in this frame
        external: false # force torque frame exists within URDF kinematic chain
      filter_coefficient: 0.005

    control:
      frame:
        id: tool0 # Admittance calcs (displacement etc) are done in this frame. Usually the tool or end-effector
        external: false # control frame exists within URDF kinematic chain

    fixed_world_frame: # Gravity points down (neg. Z) in this frame (Usually: world or base_link)
      frame:
        id: base_link # Admittance calcs (displacement etc) are done in this frame. Usually the tool or end-effector
        external: false # control frame exists within URDF kinematic chain

    gravity_compensation:
      frame:
        id: tool0
        external: false

      CoG: # specifies the center of gravity of the end effector
        pos:
          - 0.1 # x
          - 0.0 # y
          - 0.0 # z
        force: 23.0 # mass * 9.81

    admittance:
      selected_axes:
        - true # x
        - true # y
        - true # z
        - true # rx
        - true # ry
        - true # rz

      # Having ".0" at the end is MUST, otherwise there is a loading error
      # F = M*a + D*v + S*(x - x_d)
      mass:
        - 5.5
        - 6.6
        - 7.7
        - 8.8
        - 9.9
        - 10.10

      damping_ratio: # damping can be used instead: zeta = D / (2 * sqrt( M * S ))
        - 2.828427 # x
        - 2.828427 # y
        - 2.828427 # z
        - 2.828427 # rx
        - 2.828427 # ry
        - 2.828427 # rz

      stiffness:
        - 214.1
        - 214.2
        - 214.3
        - 214.4
        - 214.5
        - 214.6
```

#### 话题

**`~/joint_references`**（输入话题）`[trajectory_msgs::msg::JointTrajectoryPoint]`

控制器处于非链式模式时的目标关节命令。

**`~/wrench_reference`**（输入话题）`[geometry_msgs::msg::WrenchStamped]`

目标力/力矩偏移（WrenchStamped 必须位于 FT 传感器的帧中）。

**`~/state`**（输出话题）`[control_msgs::msg::AdmittanceControllerState]`

发布内部状态的话题。

### 4.1.2 ros2_control 接口

#### 参考接口（References）

控制器以 `<controller_name>/<joint_name>/[position|velocity]` 的格式导出 `position` 和 `velocity` 参考接口。

#### 状态接口（States）

状态接口由 `joints` 和 `state_interfaces` 参数定义，格式为：`<joint>/<state_interface>`。支持的状态接口是 hardware_interface/hardware_interface_type_values.hpp 中定义的 `position`、`velocity` 和 `acceleration`。如果某个接口未提供，将使用上次命令的接口进行计算。

为处理 TCP 力/力矩，使用了 *Force Torque Sensor* 语义组件（来自 *controller_interface* 包）。这些接口以 `ft_sensor.name` 为前缀，构成如下接口：`<sensor_name>/[force.x|force.y|force.z|torque.x|torque.y|torque.z]`。

#### 命令接口（Commands）

命令接口由 `joints` 和 `command_interfaces` 参数定义，格式为：`<joint>/<command_interface>`。支持的命令接口是 hardware_interface/hardware_interface_type_values.hpp 中定义的 `position`、`velocity` 和 `acceleration`。

---

## 4.2 力控制器（Effort Controllers）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/effort_controllers/doc/userdoc.html>

这是一组使用“力”（effort）关节命令接口工作的控制器集合，但可以在控制器层面接受不同的关节级命令，例如控制某个关节上的力以实现设定的位置。

该包包含以下控制器：

### 4.2.1 effort_controllers/JointGroupEffortController

这是 forward_command_controller 的一个特化实现，使用“effort”关节接口工作。

#### 控制器的 ROS 2 接口

**话题**

**`~/commands`**（输入话题）`[std_msgs::msg::Float64MultiArray]`

关节的力命令。

**参数**

该控制器覆盖了 forward_command_controller 的 interface 参数，并且 `joints` 参数是唯一必需的参数。

此处给出一个示例参数文件：

```yaml
controller_manager:
  ros__parameters:
    update_rate: 100  # Hz

    effort_controller:
      type: effort_controllers/JointGroupEffortController

effort_controller:
  ros__parameters:
    joints:
      - slider_to_cart
```

---

## 4.3 前馈命令控制器（Forward Command Controller）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/forward_command_controller/doc/userdoc.html>

这是一个实现前馈控制器（feedforward controller）的基类。该基类的具体实现可以在以下位置找到：

- position_controllers
- velocity_controllers
- effort_controllers

### 4.3.1 硬件接口类型

该控制器可用于所有类型的命令接口。

### 4.3.2 控制器的 ROS 2 接口

#### 话题

**`~/commands`**（输入话题）`[std_msgs::msg::Float64MultiArray]`

目标关节命令。

#### 参数

该控制器使用 generate_parameter_library 来处理其参数。

> 注：`forward_command_controller` 与 `multi_interface_forward_command_controller`

**`joints`** (string_array)

要控制的关节名称。

- 默认值：{}

**`interface_name`** (string)

要命令的接口名称。

- 默认值：""

**`joint`** (string)

要控制的关节名称。

- 默认值：""

**`interface_names`** (string_array)

要命令的接口名称。

- 默认值：{}

---

## 4.4 夹爪控制器（Gripper Controllers）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/gripper_controllers/doc/userdoc.html>

用于执行简单单自由度夹爪的夹爪命令动作（gripper command action）的控制器：

- `position_controllers/GripperActionController`
- `effort_controllers/GripperActionController`

> **注意**
>
> `effort_controllers/GripperActionController` 和 `position_controllers/GripperActionController` 将被移除。应改用 `parallel_gripper_action_controller/GripperActionController`。（#1652）

### 4.4.1 参数

这些控制器使用 generate_parameter_library 来处理其参数。位于 src 文件夹中的参数定义文件包含控制器使用的所有参数的说明。

**参数列表**

**`action_monitor_rate`** (double)

Hz

- 默认值：20.0
- 约束：大于或等于 0.1

**`joint`** (string)

- 默认值：""

**`goal_tolerance`** (double)

- 默认值：0.01
- 约束：大于或等于 0.0

**`max_effort`** (double)

最大允许力。

- 默认值：0.0
- 约束：大于或等于 0.0

**`allow_stalling`** (bool)

允许堵转（stalling）：当夹爪向目标移动时发生堵转，动作服务器将返回成功。

- 默认值：false

**`stall_velocity_threshold`** (double)

堵转速度阈值。

- 默认值：0.001

**`stall_timeout`** (double)

堵转超时。

- 默认值：1.0

#### 示例参数文件

```yaml
gripper_action_controller:
  ros__parameters:
    action_monitor_rate: 20.0
    allow_stalling: false
    goal_tolerance: 0.01
    joint: ''
    max_effort: 0.0
    stall_timeout: 1.0
    stall_velocity_threshold: 0.001
```

---

## 4.5 GPIO 控制器（GPIO Controllers）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/gpio_controllers/doc/userdoc.html>

这是一组用于 GPIO 类型硬件接口（URDF 中的 `<gpio>` 标签）的控制器集合。

### 4.5.1 gpio_command_controller

gpio_command_controller 允许用户暴露给定 GPIO 接口的命令接口，并发布所配置命令接口的状态接口。

#### 控制器接口说明

- `/<controller_name>/gpio_states` `[control_msgs/msg/DynamicJointState]`：发布给定 GPIO 接口的所有状态接口。
- `/<controller_name>/commands` `[control_msgs/msg/DynamicJointState]`：用于已配置命令接口的订阅者。

#### 参数

该控制器使用 generate_parameter_library 来处理其参数。位于 src 文件夹中的参数定义文件包含控制器使用的所有参数的说明。

**`gpios`** (string_array)

GPIO 列表。

- 只读：True
- 约束：长度大于 0；不包含重复项

**`command_interfaces.<gpios>.interfaces`** (string_array)

每个 GPIO 的命令接口列表。

- 只读：True
- 默认值：{}
- 约束：不包含重复项

**`state_interfaces.<gpios>.interfaces`** (string_array)

每个 GPIO 的状态接口列表。如果为空，则使用所有可用的 GPIO 状态。

- 只读：True
- 默认值：{}
- 约束：不包含重复项

控制器期望至少有一个 GPIO 接口以及相应的命令接口名称或状态接口。但是，这些命令和状态接口是可选的。当没有命令接口时，控制器表现为广播器（broadcaster），从而发布配置的 GPIO 状态接口（如果已设置），否则发布 URDF 中存在的 GPIO 状态接口。

> **注意**
>
> 当参数文件中未提供状态接口时，控制器将尝试使用 ros2_control 配置中置于 URDF 中的、针对已配置 gpio 接口的 state_interfaces。但是，命令接口不会根据可用的 URDF 设置进行配置。

```yaml
gpio_command_controller:
  ros__parameters:
    type: gpio_controllers/GpioCommandController
    gpios:
      - Gpio1
      - Gpio2
    command_interfaces:
      Gpio1:
        - interfaces:
          - dig.1
          - dig.2
          - dig.3
      Gpio2:
        - interfaces:
          - ana.1
          - ana.2
    state_interfaces:
      Gpio2:
        - interfaces:
          - ana.1
          - ana.2
```

使用上述控制器配置，控制器将接受所有 GPIO 接口的命令，并且只发布 Gpio2 的状态。

---



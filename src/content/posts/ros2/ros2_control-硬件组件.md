---
title: "ros2_control 核心框架（三）：硬件组件 Hardware Components"
published: 2026-08-31
description: "ros2_control 硬件组件中文翻译：硬件接口类型、编写硬件组件、不同更新频率、异步执行、语义组件、Mock 组件、硬件生命周期与 read()/write() 错误处理。"
image: ""
tags: ["ROS2", "机器人", "ros2_control", "翻译"]
category: ROS2专题
slug: ros2-control-hardware-components
series: "ROS2-Control 官方文档中文翻译"
seriesOrder: 3
draft: false
lang: "zh-CN"
---

> **原文地址**：<https://control.ros.org/jazzy/doc/ros2_control/doc/index.html>
> **原文版本**：ROS 2 Jazzy（较旧但仍受支持的版本，最新版见 Kilted）
> **翻译说明**：本文为《ros2_control 核心框架官方文档（Jazzy 版）中文翻译》系列分篇，覆盖「Hardware Components（硬件组件）」。为保证可读性与准确性：正文与说明性文字译为中文；代码、命令、参数名、消息类型、ROS 标识符等保留原文；关键术语在首次出现时标注英文原文。
> **原文档仓库**：<https://github.com/ros-controls/ros2_control>

# 3. Hardware Components（硬件组件）

> 原文：<https://control.ros.org/jazzy/doc/ros2_control/hardware_interface/doc/hardware_components_userdoc.html>

硬件组件（hardware components）在 ros2_control 框架中代表对物理硬件的抽象。硬件组件有三种类型：Actuator（执行器）、Sensor（传感器）和 System（系统）。各类型的详细说明见 [Hardware Interface Types（硬件接口类型）](#31-hardware-interface-types硬件接口类型) 部分。

本节包含以下子主题：

- [Hardware Interface Types（硬件接口类型）](#31-hardware-interface-types硬件接口类型)
- [Writing a Hardware Component（编写硬件组件）](#32-writing-a-hardware-component编写硬件组件)
- [Different Update Rates（不同的更新频率）](#33-different-update-rates不同的更新频率)
- [Asynchronous Execution（异步执行）](#34-asynchronous-execution异步执行)
- [Semantic Components（语义组件）](#35-semantic-components语义组件)
- [Mock Components（模拟组件）](#36-mock-components模拟组件)
- [Lifecycle of a Hardware Component（硬件组件的生命周期）](#37-lifecycle-of-a-hardware-component硬件组件的生命周期)
- [Handling of Errors During read() and write() Calls（read() 与 write() 调用期间的错误处理）](#38-handling-of-errors-during-read-and-write-callsread-与-write-调用期间的错误处理)

---

## 3.1 Hardware Interface Types（硬件接口类型）

> 原文：<https://control.ros.org/jazzy/doc/ros2_control/hardware_interface/doc/hardware_interface_types_userdoc.html>

`ros2_control` 框架提供了一组硬件接口类型，可用于为特定机器人或设备实现硬件组件。以下各节描述不同的硬件接口类型及其用法。

### 3.1.1 概述

ros2_control 中的硬件以 URDF 描述，并在内部解析并封装为 `HardwareInfo`。其定义可以在 ros2_control 仓库中找到。你可以查看其中定义的结构体，了解每个 xml 标签可用的属性。下面提供了一个展示结构的通用示例。更具体的示例见下文 "示例" 部分。

```xml
<ros2_control name="Name_of_the_hardware" type="system">
  <hardware>
    <plugin>library_name/ClassName</plugin>
    <!-- added to hardware_parameters -->
    <param name="example_param">value</param>
  </hardware>
  <joint name="name_of_the_component">
    <!-- `data_type` argument is optional (defaults to double). -->
    <command_interface name="interface_name" data_type="double">
      <!-- All of them are optional. -->
      <param name="min">-1</param>
      <param name="max">1</param>
      <param name="initial_value">0.0</param>
       <!-- Optional. Added to the key/value storage parameters -->
      <param name="own_param_1">some_value</param>
      <param name="own_param_2">other_value</param>
    </command_interface>
    <!-- Short form to define StateInterface. Can be extended like CommandInterface. -->
    <state_interface name="position"/>
  </joint>
</ros2_control>
```

### 3.1.2 关节（Joints）

`<joint>` 标签对与物理机器人及执行器的关节相关联的接口进行分组。它们具有命令接口和状态接口，用于向硬件设置目标值并读取其当前状态。

在 `<ros2_control>` 标签中定义的所有关节都必须出现在控制器管理器收到的 URDF 中。

关节的状态接口可以通过 joint_state_broadcaster 作为 ROS 话题发布。

### 3.1.3 传感器（Sensors）

`<sensor>` 标签对多个状态接口进行分组，例如描述硬件的内部状态。

根据传感器的类型，ros2_controllers 中提供了一些特定的语义组件及其广播器，详见 [语义组件](#35-semantic-components语义组件) 一节。

### 3.1.4 GPIO

`<gpio>` 标签用于描述无法与任何关节或传感器关联的机器人设备的输入/输出端口。`<gpio>` 标签的解析方式与具有命令接口和状态接口的 `<joint>` 标签类似。该标签必须至少有一个 `<command>` 或 `<state>` 子标签。

选择 "gpio" 这个关键词是为了其通用性。虽然严格来说它用于数字信号，但它描述的是任何电气的模拟/数字信号或物理量。

`<gpio>` 标签可以用作全部三种类型硬件组件（system、sensor 或 actuator）的子标签。

由于实现为 `<gpio>` 标签的端口通常与应用高度相关，因此 ros2_control 框架中没有通用的发布器。每个应用都必须实现自定义的 gpio 控制器。作为示例，可参见 demo 仓库中的 GPIO 控制器示例。

### 3.1.5 硬件组（Hardware Groups）

硬件组件组（Hardware Component Groups）是复杂系统中关键的组织机制，有助于错误处理和容错。通过将相关的硬件组件分组（例如机械臂中的执行器），用户可以建立一个统一的错误检测与响应框架。

硬件组件组在跨相互连接的硬件组件传播错误方面发挥着重要作用。例如，在机械臂系统中，将执行器分组在一起可以实现错误传播。如果组内某个执行器发生故障，错误可以传播到其他执行器，提示系统可能出现问题。默认情况下，执行器错误被隔离在其自身的硬件组件内，使其余组件不受影响地继续运行。在提供的 ros2_control 配置中，每个 `<ros2_control>` 块内的 `<group>` 标签表示硬件组件的分组，使系统内的错误传播机制得以启用。

### 3.1.6 数据类型（Data Types）

默认情况下，命令接口和状态接口使用 `double` 数据类型。不过，可以通过 `<command_interface>` 和 `<state_interface>` 标签中的可选 `data_type` 参数指定其他数据类型。支持以下数据类型及其默认初始值（若未指定）：

- double（默认）：NaN
- float32：NaN
- bool：false
- uint8：255
- int8：127
- uint16：65535
- int16：32767
- uint32：4294967295
- int32：2147483647

### 3.1.7 示例

以下示例展示如何在 `ros2_control` URDF 中使用不同的硬件接口类型。它们可以在不同类型的硬件组件（system、actuator、sensor，详见文档）内组合使用：

**1. 具有多个 GPIO 接口的机器人**

- RRBot System
- 数字：4 输入 2 输出（bool）
- 模拟：2 输入 1 输出（uint16）
- 法兰上的真空阀（bool）

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
    <command_interface name="digital_output1" data_type="bool"/>
    <state_interface name="digital_output1" data_type="bool"/>    <!-- Needed to know current state of the output -->
    <command_interface name="digital_output2" data_type="bool"/>
    <state_interface name="digital_output2" data_type="bool"/>
    <state_interface name="digital_input1" data_type="bool"/>
    <state_interface name="digital_input2" data_type="bool"/>
  </gpio>
  <gpio name="flange_analog_IOs">
    <command_interface name="analog_output1" data_type="uint16"/>
    <state_interface name="analog_output1" data_type="uint16">    <!-- Needed to know current state of the output -->
      <param name="initial_value">3.1</param>  <!-- Optional initial value for mock_hardware -->
    </state_interface>
    <state_interface name="analog_input1" data_type="uint16"/>
    <state_interface name="analog_input2" data_type="uint16"/>
  </gpio>
  <gpio name="flange_vacuum">
    <command_interface name="vacuum" data_type="bool"/>
    <state_interface name="vacuum" data_type="bool"/>    <!-- Needed to know current state of the output -->
  </gpio>
</ros2_control>
```

**2. 具有电气夹持和吸盘抓取能力的夹爪**

- Multimodal gripper（多模态夹爪）
- 1-DoF 平行夹爪
- 吸盘开关

```xml
<ros2_control name="MultimodalGripper" type="actuator">
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
  <gpio name="suction">
    <command_interface name="suction"/>
    <state_interface name="suction"/>    <!-- Needed to know current state of the output -->
  </gpio>
</ros2_control>
```

**3. 带温度反馈和可调标定的力/力矩传感器**

- 2D FTS（二维力/力矩传感器）
- 温度反馈（单位 °C）
- 可在 3 个标定矩阵（即标定范围）之间选择

```xml
<ros2_control name="RRBotForceTorqueSensor2D" type="sensor">
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

**4. 具有多个属于同一组 `Group1` 的硬件组件的机器人**

- RRBot System 1 和 2
- 数字：共 4 输入 2 输出
- 模拟：共 2 输入 1 输出
- 法兰上的真空阀（开/关）
- 组：Group1

```xml
<ros2_control name="RRBotSystem1" type="system">
  <hardware>
    <plugin>ros2_control_demo_hardware/RRBotSystemPositionOnlyHardware</plugin>
    <group>Group1</group>
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
  <gpio name="flange_analog_IOs">
    <command_interface name="analog_output1"/>
    <state_interface name="analog_output1">    <!-- Needed to know current state of the output -->
      <param name="initial_value">3.1</param>  <!-- Optional initial value for mock_hardware -->
    </state_interface>
    <state_interface name="analog_input1"/>
    <state_interface name="analog_input2"/>
  </gpio>
  <gpio name="flange_vacuum">
    <command_interface name="vacuum"/>
    <state_interface name="vacuum"/>    <!-- Needed to know current state of the output -->
  </gpio>
</ros2_control>
<ros2_control name="RRBotSystem2" type="system">
  <hardware>
    <plugin>ros2_control_demo_hardware/RRBotSystemPositionOnlyHardware</plugin>
    <group>Group1</group>
    <param name="example_param_hw_start_duration_sec">2.0</param>
    <param name="example_param_hw_stop_duration_sec">3.0</param>
    <param name="example_param_hw_slowdown">2.0</param>
  </hardware>
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
```

## 3.2 Writing a Hardware Component（编写硬件组件）

> 原文：<https://control.ros.org/jazzy/doc/ros2_control/hardware_interface/doc/writing_new_hardware_component.html>

在 ros2_control 中，硬件系统组件是库，由控制器管理器通过 pluginlib 接口动态加载。以下是创建新硬件接口的源文件、基础测试和编译规则的逐步指南。

**1. 准备包（Preparing package）**

如果硬件接口的包不存在，请先创建它。该包应使用 `ament_cmake` 作为构建类型。最简单的方式是在线搜索最新的手册。`ros2 pkg create` 命令可辅助此过程，使用 `--help` 标志可了解更多用法。该命令还提供了创建库源文件和编译规则的选项，可帮助完成后续步骤。

**2. 准备源文件（Preparing source files）**

创建包之后，其中至少应有 `CMakeLists.txt` 和 `package.xml` 文件。如果 `include/<PACKAGE_NAME>/` 和 `src` 文件夹不存在，请一并创建。在 `include/<PACKAGE_NAME>/` 文件夹中添加 `<robot_hardware_interface_name>.hpp`，在 `src` 文件夹中添加 `<robot_hardware_interface_name>.cpp`。

**3. 在头文件（.hpp）中添加声明**

1. 注意使用头文件保护（header guards）。ROS2 风格是使用 `#ifndef` 和 `#define` 预处理指令。（关于这一点，搜索引擎可以帮到你 :)）。
2. 包含 `"hardware_interface/$interface_type$_interface.hpp"`。根据所使用的硬件类型，`$interface_type$` 可以是 `Actuator`、`Sensor` 或 `System`。每种类型的更多细节参见 [Hardware Interface Types](#31-hardware-interface-types硬件接口类型)。
3. 为你的 hardware_interface 定义一个唯一的命名空间。这通常是使用 `snake_case` 书写的包名。
4. 定义 hardware_interface 的类，继承 `$InterfaceType$Interface`，例如：

```cpp
class HardwareInterfaceName : public hardware_interface::$InterfaceType$Interface
```

5. 添加一个无参构造函数，以及以下实现 `LifecycleNodeInterface` 的公有方法：`on_configure`、`on_cleanup`、`on_shutdown`、`on_activate`、`on_deactivate`、`on_error`；并重写 `$InterfaceType$Interface` 定义的方法：`on_init`、`export_state_interfaces`、`export_command_interfaces`、`prepare_command_mode_switch`（可选）、`perform_command_mode_switch`（可选）、`read`、`write`。

> 关于硬件生命周期的进一步说明，请参见相关 pull request；方法的确切定义请查看 `"hardware_interface/$interface_type$_interface.hpp"` 头文件，或 _Actuator_、_Sensor_、_System_ 的 doxygen 文档。

**4. 在源文件（.cpp）中添加定义**

1. 包含硬件接口的头文件，并添加命名空间定义以简化后续开发。
2. 实现 `on_init` 方法。在此应初始化所有成员变量，并处理 `info` 参数中的参数。第一行通常调用父类的 `on_init` 来处理标准值（如名称），即：`hardware_interface::(Actuator|Sensor|System)Interface::on_init(info)`。如果所有必需参数都已设置且有效、一切正常，返回 `CallbackReturn::SUCCESS`；否则返回 `return CallbackReturn::ERROR`。

   1. **（可选）添加发布者、服务等**

   硬件组件的一个常见需求是发布状态或诊断信息，同时不干扰实时控制循环。

   这允许你向硬件接口添加任何标准 ROS 2 组件（发布者、订阅者、服务、定时器），而不会牺牲实时性能。实现此目的主要有两种方式。

   **方法 1：使用框架管理的节点（推荐且最简单）**

   框架会为每个硬件组件在内部创建一个专用的 ROS 2 节点。你的硬件插件可以获取该节点的句柄并使用它。

   1. **访问并使用默认节点**：你可以通过调用 `get_node()` 方法获取节点的 `shared_ptr`，并像使用任何其他 `rclcpp::Node::SharedPtr` 一样使用它来创建发布者、定时器等。

   ```cpp
   // Continuing inside on_configure()
   if (get_node())
   {
      my_publisher_ = get_node()->create_publisher<std_msgs::msg::String>("~/status", 10);

      using namespace std::chrono_literals;
      my_timer_ = get_node()->create_wall_timer(1s, [this]() {
         std_msgs::msg::String msg;
         msg.data = "Hardware status update!";
         my_publisher_->publish(msg);
      });
   }
   ```

   **方法 2：使用 `HardwareComponentParams` 中的执行器**

   对于需要直接控制节点创建的更高级用例，可以配置 `on_init` 方法接收一个 `HardwareComponentParams` 结构体。该结构体包含一个指向 `ControllerManager` 执行器的 `weak_ptr`。

   1. **更新 `on_init` 签名**：首先，你的硬件接口必须重写接受 `HardwareComponentParams` 的 `on_init` 版本。

   ```cpp
   // In your <robot_hardware_interface_name>.hpp
   hardware_interface::CallbackReturn on_init(
   const hardware_interface::HardwareComponentParams & params) override;
   ```

   2. **锁定并使用执行器**：在 `on_init` 内部，你必须安全地 "lock" `weak_ptr` 以获得可用的 `shared_ptr`。然后可以创建自己的节点并将其添加到执行器。

   ```cpp
   // In your <robot_hardware_interface_name>.cpp, inside on_init(params)
   if (auto locked_executor = params.executor.lock())
   {
      my_custom_node_ = std::make_shared<rclcpp::Node>("my_custom_node");
      locked_executor->add_node(my_custom_node_->get_node_base_interface());
      // ... create publishers/timers on my_custom_node_ ...
   }
   ```

   有关使用框架管理节点发布诊断消息的完整可运行实现，参见 example 17 中的 demo。

3. 编写 `on_configure` 方法，通常在此建立与硬件的通信，并将一切设置为可激活硬件所需的状态。
4. 实现 `on_cleanup` 方法，它与 `on_configure` 相反。
5. `Command-/StateInterfaces`（命令/状态接口）现在由框架根据 `ros2_control` XML 标签中定义的接口，通过 `on_export_command_interfaces()` 或 `on_export_state_interfaces()` 方法自动创建和导出；XML 会被解析并相应创建 `InterfaceDescription`（参见 hardware_info.hpp）。

   - 为了访问自动创建的 `Command-/StateInterfaces`，我们提供 `std::unordered_map<std::string, InterfaceDescription>`，其中字符串是接口的完全限定名，`InterfaceDescription` 是接口的配置。`std::unordered_map<>` 分为 `type_state_interfaces_` 和 `type_command_interfaces_`，其中 type 可以是：`joint`、`sensor`、`gpio` 和 `unlisted`。例如，所有关节的 `CommandInterfaces` 可以在 `joint_command_interfaces_` map 中找到。`unlisted` 包含所有未在 `ros2_control` XML 标签中列出、但通过重写 `export_unlisted_command_interface_descriptions()` 或 `export_unlisted_state_interface_descriptions()` 函数创建的自定义 `Command-/StateInterfaces`。
   - 对于 `Sensor` 类型的硬件接口，没有 `export_command_interfaces` 方法。
   - 提醒：完整的接口名称结构为 `<joint_name>/<interface_type>`。

6. （可选）如果你想要一些未包含在 `ros2_control` XML 标签中的 `Command-/StateInterfaces`，可以按以下步骤操作：

   1. 重写 `virtual std::vector<hardware_interface::InterfaceDescription> export_unlisted_command_interface_descriptions()` 或 `virtual std::vector<hardware_interface::InterfaceDescription> export_unlisted_state_interface_descriptions()`。
   2. 在重写的 `export_unlisted_command_interface_descriptions()` 或 `export_unlisted_state_interface_descriptions()` 函数中，为你想要创建的每个接口创建 `InterfaceDescription`，添加到 vector 并返回：

   ```cpp
   std::vector<hardware_interface::InterfaceDescription> my_unlisted_interfaces;

   InterfaceInfo unlisted_interface;
   unlisted_interface.name = "some_unlisted_interface";
   unlisted_interface.min = "-5.0";
   unlisted_interface.data_type = "double";
   my_unlisted_interfaces.push_back(InterfaceDescription(info_.name, unlisted_interface));

   return my_unlisted_interfaces;
   ```

   3. 未列出的接口随后会存储到 `unlisted_command_interfaces_` 或 `unlisted_state_interfaces_` map 中，具体取决于它们在哪个函数中被创建。
   4. 你可以像访问任何其他接口一样，使用 `get_state(name)`、`set_state(name, value)`、`get_command(name)` 或 `set_command(name, value)` 访问它。例如 `get_state("some_unlisted_interface")`。

7. （可选）如果导出 `Command-/StateInterfaces` 的默认实现（`on_export_command_interfaces()` 或 `on_export_state_interfaces()`）不够用，你可以重写它们。但应考虑以下几点：

   - 如果你想拥有未列出的接口，需要调用 `export_unlisted_command_interface_descriptions()` 或 `export_unlisted_state_interface_descriptions()`，并将其添加到 `unlisted_command_interfaces_` 或 `unlisted_state_interfaces_` 中。
   - 不要忘记在内部存储创建的 `Command-/StateInterfaces`，因为你只返回 shared_ptr，而资源管理器不会为硬件提供对已创建 `Command-/StateInterfaces` 的访问。因此你必须自己负责存储它们。
   - 名称必须唯一！

8. （可选）对于 _Actuator_ 和 _System_ 类型的硬件接口，如果你的硬件接受多种控制模式，请实现 `prepare_command_mode_switch` 和 `perform_command_mode_switch`。
9. 实现 `on_activate` 方法，在此启用硬件的 "电源"。
10. 实现 `on_deactivate` 方法，它与 `on_activate` 相反。
11. 实现 `on_shutdown` 方法，在此优雅地关闭硬件。
12. 实现 `on_error` 方法，在此处理来自所有状态的各种错误。
13. 实现 `read` 方法，从硬件获取状态并存储到 `export_state_interfaces` 中定义的内部变量。
14. 实现 `write` 方法，根据 `export_command_interfaces` 中定义的内部变量存储的值向硬件下发命令。
15. 重要：在文件末尾、命名空间关闭之后，添加 `PLUGINLIB_EXPORT_CLASS` 宏。

> 为此你需要包含 `"pluginlib/class_list_macros.hpp"` 头文件。第一个参数应提供确切的硬件接口类，例如 `<my_hardware_interface_package>::<RobotHardwareInterfaceName>`；第二个参数是基类，即 `hardware_interface::(Actuator|Sensor|System)Interface`。

**5. 为 pluginlib 编写导出定义**

1. 在包中创建 `<my_hardware_interface_package>.xml` 文件，添加对 pluginlib 可见的库和硬件接口类的定义。最简单的方式是参考 hardware_interface 的 mock_components 部分中 mock 组件的定义。
2. 通常，插件名称由包（命名空间）和类名定义，例如 `<my_hardware_interface_package>/<RobotHardwareInterfaceName>`。当资源管理器搜索硬件接口时，该名称定义了硬件接口的类型。另外两个参数必须与 `<robot_hardware_interface_name>.cpp` 文件底部宏中的定义一致。

**6. 编写一个简单测试，检查控制器能否被找到并加载**

1. 在包中创建 `test` 文件夹（如果尚不存在），并添加一个名为 `test_load_<robot_hardware_interface_name>.cpp` 的文件。
2. 你可以复制 test_generic_system.cpp 包中定义的 `load_generic_system_2dof` 内容。
3. 修改所复制测试的名称，并在最后一行指定硬件接口类型处，填入 `<my_hardware_interface_package>.xml` 文件中定义的名称，例如 `<my_hardware_interface_package>/<RobotHardwareInterfaceName>`。

**7. 在 `CMakeLists.txt` 文件中添加编译指令**

1. 在 `find_package(ament_cmake REQUIRED)` 一行下面添加更多依赖。至少包括：`hardware_interface`、`pluginlib`、`rclcpp` 和 `rclcpp_lifecycle`。
2. 添加一个以 `<robot_hardware_interface_name>.cpp` 文件为源码的共享库编译指令。
3. 为该库添加目标的 include 目录。通常只需要 `include`。
4. 添加该库所需的 ament 依赖。至少应添加上述第 1 条列出的依赖。
5. 使用以下命令导出 pluginlib 描述文件：

```cmake
pluginlib_export_plugin_description_file(hardware_interface <my_hardware_interface_package>.xml)
```

6. 为目标和 include 目录添加 install 指令。
7. 在测试部分添加以下依赖：`ament_cmake_gmock`、`hardware_interface`。
8. 使用 `ament_add_gmock` 指令为测试添加编译定义。具体做法可参考 ros2_control 包中 mock 硬件的实现。
9. （可选）在 `ament_package()` 之前，将硬件接口库添加到 `ament_export_libraries`。

**8. 在 `package.xml` 文件中添加依赖**

1. 在 `<depend>` 标签中至少添加以下包：`hardware_interface`、`pluginlib`、`rclcpp` 和 `rclcpp_lifecycle`。
2. 在 `<test_depend>` 标签中至少添加以下包：`ament_add_gmock` 和 `hardware_interface`。

**9. 编译并测试硬件组件**

1. 现在一切就绪，可以使用 `colcon build <my_hardware_interface_package>` 命令编译硬件组件。请记得在执行命令前进入工作空间的根目录。
2. 如果编译成功，source install 文件夹中的 `setup.bash` 文件，然后执行 `colcon test <my_hardware_interface_package>`，检查新控制器能否通过 `pluginlib` 库找到并被控制器管理器加载。

就是这样！祝你编写出优秀的控制器！

### 3.2.1 有用的外部参考

- 生成控制器外壳的模板和脚本

> **注意**
>
> 该脚本目前仅推荐用于 Foxy 和 Humble，与 Jazzy 及之后版本的 API 不兼容。

## 3.3 Different Update Rates（不同的更新频率）

> 原文：<https://control.ros.org/jazzy/doc/ros2_control/hardware_interface/doc/different_update_rates_userdoc.html>

`ros2_control` 框架允许不同的硬件组件以不同的更新频率运行。当某些硬件组件需要以不同于传统控制循环频率（即与 `controller_manager` 相同的频率）运行时非常有用。在带有不同传感器或使用不同通信协议的不同组件的机器人系统中，不同组件具有不同频率是非常典型的。当你有一个硬件组件需要以比其他组件更高的频率运行时，这也很有用。例如，你可能有一个需要以 1000Hz 读取的传感器，而其余组件可以以 500Hz 运行，前提是 `controller_manager` 的控制循环频率高于 1000Hz。可以通过向硬件组件的 `ros2_control` 标签添加 `rw_rate` 参数来轻松定义读/写频率。

### 3.3.1 示例

以下示例展示如何在 `ros2_control` URDF 中使用具有不同更新频率的不同硬件接口类型。它们可以在不同类型的硬件组件（system、actuator、sensor，详见文档）内组合使用。

对于一个带多模态夹爪和外部传感器、且以不同频率运行的 RRBot：

```xml
<ros2_control name="RRBotSystemMutipleGPIOs" type="system" rw_rate="500">
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
<ros2_control name="MultimodalGripper" type="actuator" rw_rate="200">
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
  <gpio name="suction">
    <command_interface name="suction"/>
    <state_interface name="suction"/>    <!-- Needed to know current state of the output -->
  </gpio>
</ros2_control>
<ros2_control name="RRBotForceTorqueSensor2D" type="sensor" rw_rate="250">
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

在上述示例中，控制 RRBot 关节的 system 硬件组件以 500Hz 运行，多模态夹爪以 200Hz 运行，力/力矩传感器以 250Hz 运行。

> **注意**
>
> 在上述示例中，`rw_rate` 参数分别对 system、actuator 和 sensor 硬件组件设置为 500 Hz、200 Hz 和 250 Hz。该参数是可选的，若未设置，将使用默认值 0，意味着硬件组件将以与 `controller_manager` 相同的频率运行。不过，如果指定的频率高于 `controller_manager` 的频率，硬件组件将以 `controller_manager` 的频率运行。

---

## 3.4 Asynchronous Execution（异步执行）

> 原文：<https://control.ros.org/jazzy/doc/ros2_control/hardware_interface/doc/asynchronous_components.html>

本节内容与 [2.4.2 异步硬件组件](#242-异步硬件组件asynchronous-hardware-components) 完全相同（同一页面在章节目录中同时作为 "Asynchronous Hardware Components" 与 "Asynchronous Execution" 出现）。请参见前文，其中详细说明了 `is_async`、`thread_priority`、`affinity`、`scheduling_policy` 和 `print_warnings` 等参数及完整示例。

---

## 3.5 Semantic Components（语义组件）

> 原文：<https://control.ros.org/jazzy/doc/ros2_control/hardware_interface/doc/semantic_components.html>

为了简化常用硬件接口的配置，可以使用所谓的语义组件（semantic components）来封装认领/释放接口的机制。基础组件 `semantic_components::SemanticComponentInterface` 和 `semantic_components::SemanticComponentCommandInterface` 分别用于定义只读和只写设备的语义组件。

现有的 `SemanticComponentInterface`（头文件链接）及其关联广播器（如有）列表：

- IMUSensor，由 IMU Sensor Broadcaster 使用
- ForceTorqueSensor，由 Force Torque Sensor Broadcaster 使用
- GPSSensor
- MagneticFieldSensor
- PoseSensor，由 Pose Broadcaster 使用
- RangeSensor，由 Range Sensor Broadcaster 使用

现有的 `SemanticComponentCommandInterface`（头文件链接）及其关联控制器（如有）列表：

- LedRgbDevice

---

## 3.6 Mock Components（模拟组件）

> 原文：<https://control.ros.org/jazzy/doc/ros2_control/hardware_interface/doc/mock_components_userdoc.html>

Mock 组件（模拟组件）是硬件组件（即 System、Sensor 和 Actuator）的简单 "仿真"。它们通过将命令镜像（mirror）到状态来提供理想行为。在离线测试 ros2_control 框架时，可以将相应的硬件接口添加进来以替代真实硬件。其主要优势是：无需接触硬件即可测试框架内部的所有 "管道"（piping）。这意味着你可以测试控制器、广播器、launch 文件，甚至与 MoveIt 等的集成。其主要目的是减少在物理硬件上的调试时间，并提升开发效率。

### 3.6.1 Generic System

该组件实现 `hardware_interface::SystemInterface`，支持命令接口和状态接口。关于硬件组件的更多信息参见详细文档。

**特性：**

- 支持 mimic 关节（从 URDF 解析，参见 URDF wiki）
- 将命令镜像到状态，可带偏移量或不带偏移量
- 提供 fake 命令接口，用于从外部节点设置传感器数据（与 forward 控制器配合使用）
- 提供 fake gpio 接口，用于从外部节点设置传感器数据（与 forward 控制器配合使用）

#### 参数

包含所有可选参数（含默认值）的完整示例：

```xml
<ros2_control name="MockHardwareSystem" type="system">
  <hardware>
    <plugin>mock_components/GenericSystem</plugin>
    <param name="calculate_dynamics">false</param>
    <param name="custom_interface_with_following_offset"></param>
    <param name="disable_commands">false</param>
    <param name="mock_gpio_commands">false</param>
    <param name="mock_sensor_commands">false</param>
    <param name="position_state_following_offset">0.0</param>
  </hardware>
  <joint name="joint1">
    <command_interface name="position"/>
    <command_interface name="velocity"/>
    <state_interface name="position">
      <param name="initial_value">3.45</param>
    </state_interface>
    <state_interface name="velocity"/>
    <state_interface name="acceleration"/>
  </joint>
  <joint name="joint2">
    <command_interface name="velocity"/>
    <command_interface name="acceleration"/>
    <state_interface name="position">
      <param name="initial_value">2.78</param>
    </state_interface>
    <state_interface name="position"/>
    <state_interface name="velocity"/>
    <state_interface name="acceleration"/>
  </joint>
  <gpio name="flange_vacuum">
    <command_interface name="vacuum"/>
    <state_interface name="vacuum" data_type="double"/>
  </gpio>
</ros2_control>
```

使用 `calculate_dynamics` 的示例见 example_2；与 GPIO 接口组合使用的示例见 example_10。

#### 组件参数

**`calculate_dynamics`** (可选；boolean；默认：false)

通过欧拉前向积分（Euler-forward integration）或有限差分从命令计算状态。

**`custom_interface_with_following_offset`** (可选；string；默认："")

将带偏移的命令映射到自定义接口（参见 `position_state_following_offset`）。

**`disable_commands`** (可选；boolean；默认：false)

禁用将命令镜像到状态。此选项有助于模拟与硬件的错误连接——什么都不坏，但突然没有来自硬件接口的反馈。或者，当硬件在没有反馈的情况下运行（即开环配置）时，它可以帮助你测试你的设置。

**`mock_gpio_commands`** (可选；boolean；默认：false)

创建 fake 命令接口，用外部命令伪造 GPIO 状态。这些接口通常由 forward 控制器使用，以提供从 ROS 世界的访问。

**`mock_sensor_commands`** (可选；boolean；默认：false)

创建 fake 命令接口，用外部命令伪造传感器测量值。这些接口通常由 forward 控制器使用，以提供从 ROS 世界的访问。

**`position_state_following_offset`** (可选；double；默认：0.0)

当命令被镜像到状态时，添加到状态值上的跟随偏移量。如果 `custom_interface_with_following_offset` 为空，则偏移量应用于 `position` 状态接口。如果设置了自定义接口，则将 `position` 状态值 + 偏移量应用于该接口。

#### 单接口参数

**`initial_value`** (可选；double)

启动后某个状态接口的初始值。示例：

```xml
<state_interface name="position">
  <param name="initial_value">3.45</param>
</state_interface>
```

如果未设置，则在 `configure` 生命周期转换中，关节状态接口的初始值设为 0.0。

> 注意：该参数与 gz_ros2_control 插件的关节接口共享。对于 Mock 组件，也可以为 gpio 或 sensor 状态接口设置初始值。

---

## 3.7 Lifecycle of a Hardware Component（硬件组件的生命周期）

> 原文：<https://control.ros.org/jazzy/doc/ros2_control/hardware_interface/doc/lifecycle_of_a_hardware_component.html>

各方法的返回值类型为 `rclcpp_lifecycle::node_interfaces::LifecycleNodeInterface::CallbackReturn`，含义如下：

- `CallbackReturn::SUCCESS`：方法执行成功。
- `CallbackReturn::FAILURE`：方法执行失败，生命周期转换未成功。
- `CallbackReturn::ERROR`：发生了应在 `on_error` 方法中处理的严重错误。

在每个方法之后，硬件转换到以下状态：

- **UNCONFIGURED（未配置）**（`on_init`、`on_cleanup`）：

  硬件仅被初始化，但通信未启动，且没有接口导入到 `ResourceManager`。

- **INACTIVE（非活动）**（`on_configure`、`on_deactivate`）：

  与硬件的通信已建立，硬件组件已配置。可以读取状态，但命令接口（仅 System 和 Actuator）不可用。

  目前，是否继续使用从 `CommandInterfaces` 收到的命令或完全跳过它们，由硬件组件实现自行决定。

> **注意**
>
> 我们计划实现安全关键接口，参见路线图中的该 PR。但目前所有命令接口都是可用且会被写入的，参见描述该情况的 issue。

- **FINALIZED（已终结）**（`on_shutdown`）：

  硬件接口已准备好卸载/销毁。已分配的内存被清理。

- **ACTIVE（活动）**（`on_activate`）：

  可以读取状态。

  仅 System 和 Actuator：

  > 硬件的电源电路已激活，硬件可以移动，例如制动器已松开。命令接口可用，且命令应被发送到硬件。

---

## 3.8 Handling of Errors During read() and write() Calls（read() 与 write() 调用期间的错误处理）

> 原文：<https://control.ros.org/jazzy/doc/ros2_control/hardware_interface/doc/handling_errors_during_read_write.html>

如果 hardware_interface 类的 `read()` 或 `write()` 方法返回 `hardware_interface::return_type::ERROR`，将调用 `on_error(previous_state)` 方法来处理发生的任何错误。

错误处理遵循节点生命周期。如果返回 `CallbackReturn::SUCCESS` 且成功，硬件将再次处于 `UNCONFIGURED` 状态；如果发生任何 `ERROR` 或 `FAILURE`，硬件将进入 `FINALIZED` 状态且无法恢复。唯一的办法是重新加载整个插件，但目前 Controller Manager 中没有对应的服务。

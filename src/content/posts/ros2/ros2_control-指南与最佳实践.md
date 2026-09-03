---
title: "ros2_control 核心框架（四）：指南与最佳实践"
published: 2026-08-31
description: "ros2_control 指南与最佳实践中文翻译：调试 Controller Manager 与插件、ros2_control 配置的观测（Introspection）与数据可视化。"
image: ""
tags: ["ROS2", "机器人", "ros2_control", "翻译"]
category: ROS2专题
slug: ros2-control-guidelines-best-practices
series: "ROS2-Control 官方文档中文翻译"
seriesOrder: 4
draft: false
lang: "zh-CN"
---

> **原文地址**：<https://control.ros.org/jazzy/doc/ros2_control/doc/index.html>
> **原文版本**：ROS 2 Jazzy（较旧但仍受支持的版本，最新版见 Kilted）
> **翻译说明**：本文为《ros2_control 核心框架官方文档（Jazzy 版）中文翻译》系列分篇，覆盖「Guidelines and Best Practices（指南与最佳实践）」。为保证可读性与准确性：正文与说明性文字译为中文；代码、命令、参数名、消息类型、ROS 标识符等保留原文；关键术语在首次出现时标注英文原文。
> **原文档仓库**：<https://github.com/ros-controls/ros2_control>

# 4. Guidelines and Best Practices（指南与最佳实践）

> 原文：<https://control.ros.org/jazzy/doc/ros2_control/doc/guidelines_and_best_practices.html>

本节包含以下子主题：

- [Debugging the Controller Manager and Plugins（调试控制器管理器与插件）](#41-debugging-the-controller-manager-and-plugins调试控制器管理器与插件)
- [Introspection of the ros2_control setup（ros2_control 配置的观测）](#42-introspection-of-the-ros2_control-setupros2_control-配置的观测)
- [Data Visualization（数据可视化）](#43-data-visualization数据可视化)

---

## 4.1 Debugging the Controller Manager and Plugins（调试控制器管理器与插件）

> 原文：<https://control.ros.org/jazzy/doc/ros2_control/doc/debugging.html>

所有控制器和硬件组件都是加载到 `controller_manager` 中的插件。因此，调试器必须附加到 `controller_manager` 上。如果你的机器人或机器上运行着多个 `controller_manager` 实例，你需要将调试器附加到与你要调试的硬件组件或控制器关联的那个 `controller_manager` 上。

### 4.1.1 操作方法

- 在系统上安装 `xterm`、`gdb` 和 `gdbserver`：

```bash
sudo apt install xterm gdb gdbserver
```

- 确保你运行的是 "debug" 或 "带调试信息的 release" 构建：在 `colcon build` 时传入 `--cmake-args -DCMAKE_BUILD_TYPE=RelWithDebInfo`。请记住，在 release 构建中，某些断点可能不会按你预期的方式工作，因为相应的代码行可能已被编译器优化。对于此类情况，建议使用完整的 Debug 构建（`--cmake-args -DCMAKE_BUILD_TYPE=Debug`）。

- 修改 launch 文件，让控制器管理器在附加调试器的情况下运行：

  - **版本 A：直接使用 gdb CLI 运行**

    在 launch 文件的 `controller_manager` 节点条目中添加 `prefix=['xterm -e gdb -ex run --args']`。由于 `ros2launch` 的工作方式，我们需要在单独的终端实例中运行特定的节点。

  - **版本 B：使用 gdbserver 运行**

    在 launch 文件的 `controller_manager` 节点条目中添加 `prefix=['gdbserver localhost:3000']`。之后，你可以将 gdb CLI 实例或你选择的任何 IDE 附加到该 `gdbserver` 实例。请确保从一个已 source 工作空间的终端启动调试器，以正确解析所有路径。

示例 launch 文件条目：

```python
# Obtain the controller config file for the ros2 control node
controller_config_file = get_package_file("<package name>", "config/controllers.yaml")

controller_manager = Node(
    package="controller_manager",
    executable="ros2_control_node",
    parameters=[controller_config_file],
    output="both",
    emulate_tty=True,
    remappings=[
        ("~/robot_description", "/robot_description")
    ],
    prefix=['xterm -e gdb -ex run --args']  # or prefix=['gdbserver localhost:3000']
)

ld.add_action(controller_manager)
```

### 4.1.2 捕获异常

- 控制器管理器默认会捕获控制器和硬件组件抛出的大多数异常，以避免整个系统崩溃。不过，它确实会将异常类型和消息打印到控制台。这可能使调试变得困难，因为调试器可能无法捕获该异常，而且异常消息也可能不够清晰，无法识别根本原因。可以通过将控制器管理器节点中的参数 `handle_exceptions` 设为 `false` 来禁用此行为；这样异常将向上传播到控制器管理器，可被调试器捕获（或在正常运行期间通过打印堆栈跟踪导致崩溃）。

示例控制器管理器配置文件：

```yaml
controller_manager:
  ros__parameters:
    update_rate: 1000
    handle_exceptions: false
```

### 4.1.3 附加说明

- **调试插件**

  只有在插件被加载之后，你才能在插件中设置断点。在 ros2_control 的语境下，这意味着在控制器/硬件组件被加载之后。

- **Debug 构建**

  通常更实用的做法是只为你想要调试的特定包包含调试信息：`colcon build --packages-select [package_name] --cmake-args -DCMAKE_BUILD_TYPE=RelWithDebInfo` 或 `colcon build --packages-select [package_name] --cmake-args -DCMAKE_BUILD_TYPE=Debug`。

- **实时（Realtime）**

> **警告**
>
> 控制器的 `update/on_activate/on_deactivate` 方法以及硬件组件的 `read/write/on_activate/perform_command_mode_switch` 方法都在实时更新循环的上下文中运行。在那里设置断点可能而且一定会引发问题，最坏情况下甚至可能损坏你的硬件。

根据经验，对于实时上下文，最好使用有意义的日志（谨慎使用），或添加额外的调试状态接口（对于控制器，也可以是添加发布者）。

不过，使用 gdb 运行 controller_manager 和你的插件对于调试诸如段错误（segfaults）之类的错误仍然非常有用，因为你可以收集到完整的回溯（backtrace）。

### 4.1.4 参考资料

- ROS 2 and GDB
- Using GDB to debug a plugin
- GDB CLI Tutorial

---

## 4.2 Introspection of the ros2_control setup（ros2_control 配置的观测）

> 原文：<https://control.ros.org/jazzy/doc/ros2_control/doc/introspection.html>

通过集成 `pal_statistics` 包，`controller_manager` 节点会将同一进程中注册的变量发布到 `~/introspection_data` 话题。默认情况下，`controller_manager` 中所有 `State` 和 `Command` 接口在添加时被注册，在从 `ResourceManager` 中移除时被注销。所有已注册实体的状态会在 `controller_manager` 每个 `update` 周期结束时发布。例如，在一个完全同步的 ros2_control 配置（使用同步控制器和硬件组件）中，`Command` 接口中的数据就是硬件组件用于控制硬件的命令。

所有已注册的变量通过 3 个话题发布：`~/introspection_data/full`、`~/introspection_data/names` 和 `~/introspection_data/values`。

- `~/introspection_data/full` 话题在单条消息中发布包含名称和值的完整观测数据。这对于从命令行跟踪或查看变量和信息很有用。
- `~/introspection_data/names` 话题发布已注册变量的名称。该话题只在变量被注册和注销时发布。
- `~/introspection_data/values` 话题发布已注册变量的值。

话题 `~/introspection_data/full` 和 `~/introspection_data/values` 在每次更新周期都会异步发布，前提是这些话题至少有一个订阅者。

话题 `~/introspection_data/full` 可用于与你的自定义可视化工具集成，或从命令行跟踪变量。话题 `~/introspection_data/names` 和 `~/introspection_data/values` 则用于 PlotJuggler 或 RQT plot 等可视化工具来可视化数据。

> **注意**
>
> 如果你的数据频率很高，建议使用 `~/introspection_data/names` 和 `~/introspection_data/values` 话题，这样可以最小化传输和存储的数据量。

除了上述观测数据外，`controller_manager` 还会发布硬件组件读/写周期以及控制器更新周期的执行时间和周期性的统计信息。这是通过注册这些变量的统计信息并将其发布到 `~/statistics` 话题来实现的，同时也会向 `/diagnostics` 话题发布摘要。

所有已注册的变量通过 3 个话题发布：`~/statistics/full`、`~/statistics/names` 和 `~/statistics/values`。

- `~/statistics/full` 话题在单条消息中发布包含名称和值的完整观测数据。这对于从命令行跟踪或查看变量和信息很有用。
- `~/statistics/names` 话题发布已注册变量的名称。该话题只在变量被注册和注销时发布。
- `~/statistics/values` 话题发布已注册变量的值。

该话题主要用于观测实时循环的行为，这对于需要满足严格截止时间的硬件至关重要，也有助于了解生态系统中哪个组件在实时循环中消耗了更多时间。

### 4.2.1 如何观测控制器和硬件组件的内部变量

控制器或硬件组件的任何成员变量都可以注册以进行观测。非常重要的是，只要控制器或硬件组件可用，该变量的生命周期就必须一直存在。

> **注意**
>
> 如果变量的生命周期没有得到妥善管理，可能会尝试读取它，最坏情况下会导致段错误。

#### 如何注册变量以进行观测

1. 在控制器或硬件组件的头文件中包含必要的头文件：

```cpp
#include <hardware_interface/introspection.hpp>
```

2. 在控制器或硬件组件的 configure 方法中注册该变量：

```cpp
void MyController::on_configure()
{
  ...
  // Register the variable for introspection (disabled by default)
  // The variable is introspected only when the controller is active and
  // then deactivated when the controller is deactivated.
  REGISTER_ROS2_CONTROL_INTROSPECTION("my_variable_name", &my_variable_);
  ...
}
```

3. 默认情况下，控制器和硬件组件的所有已注册变量的观测只在它们处于活动（active）状态时被激活，并在控制器或硬件组件被停用时停用。

> **注意**
>
> 如果你希望在控制器或硬件组件不活动时也保持观测处于激活状态，可以在注册变量后，在控制器或硬件组件的 `on_configure` 和 `on_deactivate` 方法中调用 `this->enable_introspection(true)`。

#### 可以被观测的实体类型

- 任何可以转换为 double 的变量都适合注册。
- 返回可以转换为 double 的值的函数也适合注册。
- 复杂结构的变量可以通过为其每个内部变量定义观测来注册。
- 可以通过定义自定义观测函数来观测自定义类型。

> **注意**
>
> 注册变量进行观测不是实时安全的。建议只在 `on_configure` 方法中注册变量。

---

## 4.3 Data Visualization（数据可视化）

数据可以用任何显示 ROS 话题的工具进行可视化，但我们推荐使用 PlotJuggler 来查看高分辨率实时数据或 bag 中的数据。

1. 在命令行运行 `ros2 run plotjuggler plotjuggler` 打开 `PlotJuggler`。
![PlotJuggler 界面](https://lux2026.oss-cn-hangzhou.aliyuncs.com/images/ros2_control/introspection/plotjuggler.png)

2. 通过从 `Streaming` 标题下的 `ROS2 Topic Subscriber` 选项导入 ros2bag 文件或实时订阅 ROS2 话题来可视化数据。
3. 在弹出窗口中选择话题 `~/introspection_data/names` 和 `~/introspection_data/values`。
![PlotJuggler 选择话题](https://lux2026.oss-cn-hangzhou.aliyuncs.com/images/ros2_control/introspection/plotjuggler_select_topics.png)

4. 然后选择你感兴趣的变量，并将其拖到绘图中。
![PlotJuggler 可视化数据](https://lux2026.oss-cn-hangzhou.aliyuncs.com/images/ros2_control/introspection/plotjuggler_visualizing_data.png)


---

> **翻译完**
>
> 本文件对应原文档章节：<https://control.ros.org/jazzy/doc/ros2_control/doc/index.html>
>
> 若发现翻译问题或希望调整术语，欢迎指正。

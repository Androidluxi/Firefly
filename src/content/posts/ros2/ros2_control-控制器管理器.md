---
title: "ros2_control 核心框架（一）：Controller Manager 控制器管理器"
published: 2026-08-31
description: "ros2_control Controller Manager 中文翻译：ROS 接口、确定性、controller_manager 启动、辅助脚本与实用工具、rqt_controller_manager 及生命周期操作。"
image: ""
tags: ["ROS2", "机器人", "ros2_control", "翻译"]
category: ROS2专题
slug: ros2-control-controller-manager
series: "ROS2-Control 官方文档中文翻译"
seriesOrder: 1
draft: false
lang: "zh-CN"
---

> **原文地址**：<https://control.ros.org/jazzy/doc/ros2_control/doc/index.html>
> **原文版本**：ROS 2 Jazzy（较旧但仍受支持的版本，最新版见 Kilted）
> **翻译说明**：本文为《ros2_control 核心框架官方文档（Jazzy 版）中文翻译》系列分篇，覆盖「Controller Manager（控制器管理器）」。为保证可读性与准确性：正文与说明性文字译为中文；代码、命令、参数名、消息类型、ROS 标识符等保留原文；关键术语在首次出现时标注英文原文。
> **原文档仓库**：<https://github.com/ros-controls/ros2_control>

# 1. Controller Manager（控制器管理器）

> 原文：<https://control.ros.org/jazzy/doc/ros2_control/controller_manager/doc/userdoc.html>

Controller Manager（控制器管理器）是 ros2_control 框架中的核心组件。它负责管理控制器的生命周期、对硬件接口的访问，并向 ROS 世界提供服务。

## 1.1 ROS 接口

### 1.1.1 发布者（Publishers）

**~/activity** `[controller_manager_msgs::msg::ControllerManagerActivity]`

每当由控制器管理器管理的控制器或硬件组件状态发生变化时，该话题都会发布一次消息。消息中包含控制器管理器所管理的控制器和硬件组件列表及其生命周期状态。该话题使用 "transient local"（瞬态本地）服务质量发布，因此订阅者也应使用 "transient local"。

### 1.1.2 订阅者（Subscribers）

**robot_description** `[std_msgs::msg::String]`

包含 URDF XML 的字符串，例如来自 `robot_state_publisher`。目前尚不支持重新加载 URDF。所有在 `<ros2_control>` 标签中定义的关节都必须出现在 URDF 中。

### 1.1.3 参数（Parameters）

**`<controller_name>.type`**

使用 `pluginlib` 导出的控制器插件名称。控制器实例（名为 "`controller_name`"）将从该类创建。

**`<controller_name>.params_file`**

控制器参数 YAML 文件的绝对路径。该文件应包含标准 ROS 2 YAML 格式的控制器参数。

**`<controller_name>.fallback_controllers`**

备用（fallback）控制器列表。当已生成的控制器在 `update` 周期中返回 `return_type::ERROR` 而失败时，会激活这些控制器作为备用策略。建议将备用策略所需的全部控制器都加入该列表，包括其接口被主备用控制器使用到的可链式（chainable）控制器。

> **警告**
>
> 备用控制器的激活取决于激活时状态接口与命令接口的可用性。建议先在仿真中测试备用策略，再部署到真实机器人上。

**`update_rate` (int)**

控制器管理器实时更新循环的频率。该循环从硬件读取状态、更新控制器、并向硬件写入命令。

- 只读：True
- 默认值：100
- 约束：大于 0

**`enforce_command_limits` (bool)**

若为 true，控制器管理器将强制执行机器人描述中定义的命令限位；若为 false，则不执行任何限位。若为 true，当命令超出限位时，会根据机器人描述中配置的关节限位类型将命令钳制（clamp）到限位范围内；若命令在限位内，则原样通过，不做任何修改。

- 只读：True
- 默认值：false

**`handle_exceptions` (bool)**

若为 true，控制器管理器将捕获控制器与硬件组件各操作期间抛出的异常；若为 false，异常将向上传播并导致控制器管理器崩溃。

- 只读：True
- 默认值：true

**`hardware_components_initial_state`**

用于硬件组件受控生命周期管理的参数映射。组件名称在 `robot_description` 中定义为 `<ros2_control>` 标签的属性。在 `robot_description` 中找到但未显式定义状态的硬件组件将被立即激活。各参数的详细说明如下。映射的完整结构见以下示例：

```yaml
hardware_components_initial_state:
  unconfigured:
    - "arm1"
    - "arm2"
  inactive:
    - "base3"
```

**`hardware_components_initial_state.unconfigured` (string_array)**

定义在控制器管理器启动时仅被加载（loaded）的硬件组件。这些硬件组件之后需要手动或通过 hardware_spawner 进行配置（configured）和激活（activated）。

- 默认值：`{}`
- 约束：不包含重复项

**`hardware_components_initial_state.inactive` (string_array)**

定义在控制器管理器启动时将被配置（configured）的硬件组件。这些硬件组件之后需要手动或通过 hardware_spawner 激活。

- 默认值：`{}`
- 约束：不包含重复项

**`hardware_components_initial_state.shutdown_on_initial_state_failure` (bool)**

指定在启动过程中设置期望初始状态失败时，控制器管理器是否应关闭。

- 只读：True
- 默认值：true

**`defaults.switch_controller.strictness` (string)**

默认的控制器切换策略。当 `switch_controller` 服务调用中未指定策略时使用该策略。

- 默认值："best_effort"
- 约束：参数非空；取值为 ['strict', 'best_effort'] 之一

**`defaults.allow_controller_activation_with_inactive_hardware` (bool)**

若为 true，允许控制器从非活动（inactive）硬件组件上认领资源；若为 false，控制器只能从活动（active）硬件组件上认领资源。然而，出于硬件安全与意外运动方面的考虑，不建议将该参数设为 true；该参数纯粹是为了向后兼容而添加。

- 只读：True
- 默认值：false

**`defaults.deactivate_controllers_on_hardware_self_deactivate` (bool)**

若设为 true，当硬件组件在 write 周期返回 DEACTIVATE 时，使用这些接口的控制器将被停用；若设为 false，使用这些接口的控制器将继续运行。出于硬件安全考虑，不建议将该参数设为 false。这将成为控制器管理器的默认行为，该参数将在未来版本中移除，请谨慎使用。

- 只读：True
- 默认值：true

**`diagnostics.threshold.controller_manager.periodicity.mean_error.warn` (double)**

控制器管理器周期性的平均误差（mean error）的警告阈值（单位 Hz）。若平均误差超过该阈值，将发布一条警告诊断。

- 默认值：5.0
- 约束：大于 0.0

**`diagnostics.threshold.controller_manager.periodicity.mean_error.error` (double)**

控制器管理器周期性的平均误差的错误阈值（单位 Hz）。若平均误差超过该阈值，将发布一条错误诊断。

- 默认值：10.0
- 约束：大于 0.0

**`diagnostics.threshold.controller_manager.periodicity.standard_deviation.warn` (double)**

控制器管理器周期性的标准差（standard deviation）的警告阈值（单位 Hz）。若标准差超过该阈值，将发布一条警告诊断。

- 默认值：5.0
- 约束：大于 0.0

**`diagnostics.threshold.controller_manager.periodicity.standard_deviation.error` (double)**

控制器管理器周期性的标准差（standard deviation）的错误阈值（单位 Hz）。若标准差超过该阈值，将发布一条错误诊断。

- 默认值：10.0
- 约束：大于 0.0

**`diagnostics.threshold.controllers.periodicity`**

`periodicity`（周期性）诊断会为异步控制器发布，因为任何对同步控制器的影响都会直接反映到控制器管理器的周期性上。对于与控制器管理器更新频率不同的同步控制器，同样会发布该诊断。

**`diagnostics.threshold.controllers.periodicity.mean_error.warn` (double)**

控制器更新循环平均误差的警告阈值（单位 Hz）。若平均误差超过该阈值，将发布一条警告诊断。

- 默认值：5.0
- 约束：大于 0.0

**`diagnostics.threshold.controllers.periodicity.mean_error.error` (double)**

控制器更新循环平均误差的错误阈值（单位 Hz）。若平均误差超过该阈值，将发布一条错误诊断。

- 默认值：10.0
- 约束：大于 0.0

**`diagnostics.threshold.controllers.periodicity.standard_deviation.warn` (double)**

控制器更新循环标准差的警告阈值（单位 Hz）。若标准差超过该阈值，将发布一条警告诊断。

- 默认值：5.0
- 约束：大于 0.0

**`diagnostics.threshold.controllers.periodicity.standard_deviation.error` (double)**

控制器更新循环标准差的错误阈值（单位 Hz）。若标准差超过该阈值，将发布一条错误诊断。

- 默认值：10.0
- 约束：大于 0.0

**`diagnostics.threshold.controllers.execution_time.mean_error`**

`execution_time`（执行时间）诊断会为所有控制器发布。同步控制器的 `mean_error` 以零为基准计算（应尽可能低）；异步控制器的 `mean_error` 则以控制器期望的更新周期为基准计算，因为控制器执行其更新周期最多可能耗时一个期望周期。

**`diagnostics.threshold.controllers.execution_time.mean_error.warn` (double)**

控制器更新周期执行时间平均误差的警告阈值（单位微秒）。若平均误差超过该阈值，将发布一条警告诊断。

- 默认值：1000.0
- 约束：大于 0.0

**`diagnostics.threshold.controllers.execution_time.mean_error.error` (double)**

控制器更新周期执行时间平均误差的错误阈值（单位微秒）。若平均误差超过该阈值，将发布一条错误诊断。

- 默认值：2000.0
- 约束：大于 0.0

**`diagnostics.threshold.controllers.execution_time.standard_deviation.warn` (double)**

控制器更新周期执行时间标准差的警告阈值（单位微秒）。若标准差超过该阈值，将发布一条警告诊断。

- 默认值：100.0
- 约束：大于 0.0

**`diagnostics.threshold.controllers.execution_time.standard_deviation.error` (double)**

控制器更新周期执行时间标准差的错误阈值（单位微秒）。若标准差超过该阈值，将发布一条错误诊断。

- 默认值：200.0
- 约束：大于 0.0

**`diagnostics.threshold.hardware_components.periodicity`**

`periodicity`（周期性）诊断会为异步硬件组件发布，因为任何对同步硬件组件的影响都会直接反映到控制器管理器的周期性上。对于与控制器管理器更新频率不同的读/写频率的同步硬件组件，同样会发布该诊断。

**`diagnostics.threshold.hardware_components.periodicity.mean_error.warn` (double)**

硬件组件读/写循环平均误差的警告阈值（单位 Hz）。若平均误差超过该阈值，将发布一条警告诊断。

- 默认值：5.0
- 约束：大于 0.0

**`diagnostics.threshold.hardware_components.periodicity.mean_error.error` (double)**

硬件组件读/写循环平均误差的错误阈值（单位 Hz）。若平均误差超过该阈值，将发布一条错误诊断。

- 默认值：10.0
- 约束：大于 0.0

**`diagnostics.threshold.hardware_components.periodicity.standard_deviation.warn` (double)**

硬件组件读/写循环标准差的警告阈值（单位 Hz）。若标准差超过该阈值，将发布一条警告诊断。

- 默认值：5.0
- 约束：大于 0.0

**`diagnostics.threshold.hardware_components.periodicity.standard_deviation.error` (double)**

硬件组件读/写循环标准差的错误阈值（单位 Hz）。若标准差超过该阈值，将发布一条错误诊断。

- 默认值：10.0
- 约束：大于 0.0

**`diagnostics.threshold.hardware_components.execution_time.mean_error`**

`execution_time`（执行时间）诊断会为所有硬件组件发布。同步硬件组件的 `mean_error` 以零为基准计算（应尽可能低）；异步硬件组件的 `mean_error` 则以其期望的读/写周期为基准计算，因为硬件组件执行读/写周期最多可能耗时一个期望周期。

**`diagnostics.threshold.hardware_components.execution_time.mean_error.warn` (double)**

硬件组件读/写周期执行时间平均误差的警告阈值（单位微秒）。若平均误差超过该阈值，将发布一条警告诊断。

- 默认值：1000.0
- 约束：大于 0.0

**`diagnostics.threshold.hardware_components.execution_time.mean_error.error` (double)**

硬件组件读/写周期执行时间平均误差的错误阈值（单位微秒）。若平均误差超过该阈值，将发布一条错误诊断。

- 默认值：2000.0
- 约束：大于 0.0

**`diagnostics.threshold.hardware_components.execution_time.standard_deviation.warn` (double)**

硬件组件读/写周期执行时间标准差的警告阈值（单位微秒）。若标准差超过该阈值，将发布一条警告诊断。

- 默认值：100.0
- 约束：大于 0.0

**`diagnostics.threshold.hardware_components.execution_time.standard_deviation.error` (double)**

硬件组件更新周期执行时间标准差的错误阈值（单位微秒）。若标准差超过该阈值，将发布一条错误诊断。

- 默认值：200.0
- 约束：大于 0.0

**`overruns.print_warnings` (bool)**

若为 true，当控制器管理器在其实时循环（`read`、`update`、`write`）中检测到超时（overrun）时，会在控制台打印警告消息。默认情况下设为 true，但当 `use_sim_time` 参数设为 true 时除外。

**参数文件示例：**

```yaml
controller_manager:
  ros__parameters:
    defaults:
      allow_controller_activation_with_inactive_hardware: false
      deactivate_controllers_on_hardware_self_deactivate: true
      switch_controller:
        strictness: best_effort
    diagnostics:
      threshold:
        controller_manager:
          periodicity:
            mean_error:
              error: 10.0
              warn: 5.0
            standard_deviation:
              error: 10.0
              warn: 5.0
        controllers:
          execution_time:
            mean_error:
              error: 2000.0
              warn: 1000.0
            standard_deviation:
              error: 200.0
              warn: 100.0
          periodicity:
            mean_error:
              error: 10.0
              warn: 5.0
            standard_deviation:
              error: 10.0
              warn: 5.0
        hardware_components:
          execution_time:
            mean_error:
              error: 2000.0
              warn: 1000.0
            standard_deviation:
              error: 200.0
              warn: 100.0
          periodicity:
            mean_error:
              error: 10.0
              warn: 5.0
            standard_deviation:
              error: 10.0
              warn: 5.0
    enforce_command_limits: false
    handle_exceptions: true
    hardware_components_initial_state:
      inactive: '{}'
      shutdown_on_initial_state_failure: true
      unconfigured: '{}'
    overruns:
      print_warnings: ''
    update_rate: 100.0
```

## 1.2 确定性（Determinism）

在控制硬件时，为了获得最佳性能，你希望控制器管理器的主控制循环中的抖动（jitter）尽可能小。

无论安装的内核是什么，Controller Manager 的主线程都会尝试以优先级 `50` 配置 `SCHED_FIFO`。更多调度策略信息可参见相关文档。

对于实时任务，预期优先级范围为 0 到 99，数值越大优先级越高。默认情况下，普通用户没有权限设置如此高的优先级。要赋予用户该权限，需添加一个名为 realtime 的组，并将控制机器人的用户加入该组：

```bash
$ sudo addgroup realtime
$ sudo usermod -a -G realtime $(whoami)
```

然后，在 `/etc/security/limits.conf` 中为 realtime 组添加以下限制：

```
@realtime soft rtprio 99
@realtime soft priority 99
@realtime soft memlock unlimited
@realtime hard rtprio 99
@realtime hard priority 99
@realtime hard memlock unlimited
```

这些限制在你注销并重新登录后生效。

你也可以从 docker 容器中运行带实时要求的 ros2_control。传入以下 capability 选项以允许容器设置线程优先级并锁定内存，例如：

```bash
$ docker run -it \
    --cap-add=sys_nice \
    --ulimit rtprio=99 \
    --ulimit memlock=-1 \
    --rm --net host <IMAGE>
```

更多信息，请参见 Docker 引擎文档中关于 resource_constraints 和 linux capabilities 的说明。

标准 Linux 内核为计算吞吐量进行了优化，因此并不太适合硬件控制。标准内核的替代方案包括：

- Ubuntu 上的 Real-time Ubuntu
- Ubuntu on Raspberry Pi 上的 linux-raspi-realtime：`sudo apt install linux-raspi-realtime`
- 64 位 PC 的 Debian 上的 linux-image-rt-amd64 或 linux-image-rt-arm64
- 任意 Ubuntu 上的 lowlatency 内核（`sudo apt install linux-lowlatency`）

虽然安装实时内核（realtime-kernel）在低抖动方面一定能获得最佳效果，但使用低延迟（lowlatency）内核也能大幅改善，而且安装非常简单。

> **注意**
>
> 避免在控制器和硬件组件的实时控制循环中使用 `get_lifecycle_state()` 方法，因为它不具备实时安全性。

### 1.2.1 影响确定性的因素

在上述条件下运行时，确定性可得到保证（受限于硬件和实时内核的限制）。然而，仍有一些情况可能影响确定性：

- 当某个控制器在实时循环中激活失败时，controller_manager 会调用 `prepare_command_mode_switch` 和 `perform_command_mode_switch` 方法来停止已启动的接口。这些调用可能导致主控制循环产生抖动。
- 如果某个控制器未能在实时循环中完成一次成功的更新周期（例如返回 `return_type::ERROR`），控制器管理器将停用该控制器（或其所属于的整个控制器链），然后调用 `prepare_command_mode_switch` 和 `perform_command_mode_switch` 停止受影响的控制器所使用的接口。这些操作也可能给主控制循环引入抖动。

## 1.3 启动 controller_manager

### 1.3.1 使用 ros2_control_node

可以使用 ros2_control_node 可执行文件启动 controller_manager。以下示例展示了如何使用 ros2_control_node 可执行文件启动 controller_manager：

```python
control_node = Node(
    package="controller_manager",
    executable="ros2_control_node",
    parameters=[robot_controllers],
    output="both",
)
```

ros2_control_node 可执行文件使用来自 `controller_manager` 节点的以下参数：

**`lock_memory`** (可选；bool；默认：非实时内核为 false，实时内核为 true)

在启动时将 `controller_manager` 节点的内存锁定到物理 RAM，以避免页面错误并防止节点被交换到磁盘。更多内存锁定的设置信息见 "How to set ulimit values" 链接。以下命令可用于临时设置内存锁定限制：`ulimit -l unlimited`。

**`cpu_affinity`** (可选；int（或）int_array)

将 `controller_manager` 节点的 CPU 亲和性设置为指定的 CPU 核。如果传入整数，节点亲和性将被设置为该 CPU 核；如果传入整数数组，节点亲和性将被设置为指定的 CPU 核集合。

**`thread_priority`** (可选；int；默认：50)

将 `controller_manager` 节点的线程优先级设置为指定值。该值必须在 0 到 99 之间。

**`use_sim_time`** (可选；bool；默认：false)

在 `controller_manager` 节点中启用仿真时间。

**`overruns.manage`** (可选；bool；默认：true)

启用或禁用 `controller_manager` 节点实时循环中超时的处理。若为 true，控制器管理器将检测由系统时间变化或控制器、硬件组件执行时间过长引起的超时。检测到超时时，控制器管理器会在控制台打印警告消息。当与 `use_sim_time` 设为 true 一起使用时，该参数被忽略，超时处理被禁用。

**`hardware_synchronization.expect_blocking_read_write`** (可选；bool；默认：false)

若为 true，控制器管理器将不主动休眠。当存在某个硬件接口在其 read 或 write 操作期间会阻塞直至从硬件收到新数据时使用此参数。

**`hardware_synchronization.minimum_cycle_time`** (可选；double；默认：0.0001)

控制节点实时循环的最小休眠时间（单位秒）。这用于防止控制节点运行过快——如果硬件在 read/write 中不阻塞，可能导致高 CPU 占用。仅在 `expect_blocking_read_write` 设为 true 时使用。若循环时间短于此值，将休眠该时长并打印警告。

### 1.3.2 处理多个控制器管理器（单/多）

在处理多个控制器管理器时，管理不同机器人描述有两种方式：

**1. 使用命名空间（Namespaces）：** 你可以将 `robot_state_publisher` 和 `controller_manager` 节点放入同一命名空间。

```python
control_node = Node(
    package="controller_manager",
    executable="ros2_control_node",
    parameters=[robot_controllers],
    output="both",
    namespace="rrbot",
)
robot_state_pub_node = Node(
    package="robot_state_publisher",
    executable="robot_state_publisher",
    output="both",
    parameters=[robot_description],
    namespace="rrbot",
)
```

**2. 使用重映射（Remappings）：** 你可以使用重映射来处理不同的机器人描述。这涉及使用 `remappings` 标签转发话题，从而为每个控制器管理器指定自定义话题。

```python
control_node = Node(
    package="controller_manager",
    executable="ros2_control_node",
    parameters=[robot_controllers],
    output="both",
    remappings=[('robot_description', '/rrbot/robot_description')]
)
robot_state_pub_node = Node(
    package="robot_state_publisher",
    executable="robot_state_publisher",
    output="both",
    parameters=[robot_description],
    namespace="rrbot",
)
```

### 1.3.3 在进程中以类的方式使用 Controller Manager

`ControllerManager` 也可以作为类在进程中实例化，但这样做时必须格外小心。原因是 `ControllerManager` 类继承自 `rclcpp::Node`。

如果进程中有多个 Node，全局节点名重映射规则也可能强制改变 `ControllerManager` 的节点名，从而导致重复的节点名。无论这些 Node 是兄弟节点还是存在层级关系，这种情况都可能发生。
![全局节点重映射规则](https://lux2026.oss-cn-hangzhou.aliyuncs.com/images/ros2_control/controller_manager/global_general_remap.png)


解决方法是：在传给 `ControllerManager` 节点的 `NodeOptions` 中指定另一条节点名重映射规则（使其忽略全局规则），或者确保任何重映射规则都针对特定节点。
![特定节点重映射规则](https://lux2026.oss-cn-hangzhou.aliyuncs.com/images/ros2_control/controller_manager/global_specific_remap.png)


```cpp
auto options = controller_manager::get_cm_node_options();
options.arguments({
  "--ros-args",
  "--remap", "_target_node_name:__node:=dst_node_name",
  "--log-level", "info"});

auto cm = std::make_shared<controller_manager::ControllerManager>(
  executor, "_target_node_name", "some_optional_namespace", options);
```

## 1.4 辅助脚本（Helper Scripts）

有两个脚本可用于从 launch 文件中与控制器管理器交互：

1. `spawner` — 在启动时加载、配置并启动一个控制器。
2. `unspawner` — 停止并卸载一个控制器。
3. `hardware_spawner` — 激活并配置一个硬件组件。

### 1.4.1 `spawner`

```bash
$ ros2 run controller_manager spawner -h
usage: spawner [-h] [-c CONTROLLER_MANAGER] [-p PARAM_FILE] [-n NAMESPACE] [--load-only] [--inactive] [-u]
              [--controller-manager-timeout CONTROLLER_MANAGER_TIMEOUT] [--switch-timeout SWITCH_TIMEOUT]
              [--service-call-timeout SERVICE_CALL_TIMEOUT] [--activate-as-group]
              [--switch-asap | --no-switch-asap] [--controller-ros-args CONTROLLER_ROS_ARGS]
              [--controller [CONTROLLER ...]]
              controller_names [controller_names ...]

positional arguments:
  controller_names      List of controllers

options:
  -h, --help            show this help message and exit
  -c CONTROLLER_MANAGER, --controller-manager CONTROLLER_MANAGER
                        Name of the controller manager ROS node
  -p PARAM_FILE, --param-file PARAM_FILE
                        Controller param file to be loaded into controller node before configure. Pass
                        multiple times to load different files for different controllers or to override the
                        parameters of the same controller.
  -n NAMESPACE, --namespace NAMESPACE
                        DEPRECATED Namespace for the controller_manager and the controller(s)
  --load-only           Only load the controller and leave unconfigured.
  --inactive            Load and configure the controller, however do not activate them
  -u, --unload-on-kill  Wait until this application is interrupted (SIGINT or SIGTERM) and deactivate/unload
                        controllers
  --controller-manager-timeout CONTROLLER_MANAGER_TIMEOUT
                        Time to wait for the controller manager service to be available
  --switch-timeout SWITCH_TIMEOUT
                        Time to wait for a successful state switch of controllers. Useful when switching
                        cannot be performed immediately, e.g., paused simulations at startup
  --service-call-timeout SERVICE_CALL_TIMEOUT
                        Time to wait for the service response from the controller manager
  --activate-as-group   Activates all the parsed controllers list together instead of one by one. Useful for
                        activating all chainable controllers altogether
  --switch-asap, --no-switch-asap
                        Option to switch the controllers in the realtime loop at the earliest possible time or
                        in the non-realtime loop.
  --controller-ros-args CONTROLLER_ROS_ARGS
                        The --ros-args to be passed to the controller node, e.g., for remapping topics. Pass
                        multiple times for every argument.
```

当使用带替换（substitution）的 ROS 参数文件启动 `spawner` 时（例如 launch 参数 `allow_substs=True`），spawner 节点所使用的解析后的 `--params-file` 路径会自动转发给每个控制器，同时也会转发传给 spawner 命令的任何显式 `--param-file` 参数。

> **注意**
>
> 如果单个参数文件用于多个控制器，spawner 会自动将解析后的路径转发给每个控制器。推荐以下两种方式：

```python
Node(
    package="controller_manager",
    executable="spawner",
    arguments=[
        "my_controller",
        "--param-file",
        PathSubstitution(FindPackageShare("my_config_pkg"))
        / "config"
        / "controllers.yaml",
    ],
),
```

（或）

```python
Node(
    package="controller_manager",
    executable="spawner",
    parameters=[
        ParameterFile(
            PathSubstitution(FindPackageShare("my_config_pkg"))
            / "config"
            / "controllers.yaml",
        ),
    ],
    arguments=[
        "my_controller"
    ],
),
```

`spawner` 现在支持按控制器传入参数，即使用 `--controller` 选项为多个控制器分别解析参数。例如，要生成两个具有不同参数文件和话题重映射的控制器，可以使用以下命令：

```bash
$ ros2 run controller_manager spawner --controller position_trajectory_controller \
    --param-file /path/to/position_trajectory_controller_params.yaml \
    --controller-ros-args "--ros-args --remap /joint_states:=/rrbot/joint_states" \
    --controller velocity_trajectory_controller \
    --param-file /path/to/velocity_trajectory_controller_params.yaml \
    --controller-ros-args "--ros-args --remap /joint_states:=/rrbot/joint_states"
```

```bash
$ ros2 run  controller_manager spawner --controller -h
Usage: spawner [global_options] --controller <name> [controller_options] --controller <name> ...

Global Options:
usage: spawner [-c CONTROLLER_MANAGER] [--controller-manager-timeout CONTROLLER_MANAGER_TIMEOUT] [--switch-timeout SWITCH_TIMEOUT] [--service-call-timeout SERVICE_CALL_TIMEOUT] [--activate-as-group] [--switch-asap | --no-switch-asap] [-u] [-h]

options:
  -c CONTROLLER_MANAGER, --controller-manager CONTROLLER_MANAGER
                        Name of the controller manager
  --controller-manager-timeout CONTROLLER_MANAGER_TIMEOUT
                        Timeout for controller manager services
  --switch-timeout SWITCH_TIMEOUT
                        Timeout for switch controller service
  --service-call-timeout SERVICE_CALL_TIMEOUT
                        Timeout for service calls
  --activate-as-group   Activate controllers as a group
  --switch-asap, --no-switch-asap
                        Switch controllers as soon as possible
  -u, --unload-on-kill  Deactivate the active controllers and unload them on SIGINT or SIGTERM
  -h, --help            Show help

Controller Options:
usage: spawner [-p PARAM_FILE] [--load-only] [--inactive] [--controller-ros-args CONTROLLER_ROS_ARGS] controller_name

positional arguments:
  controller_name       Name of the controller

options:
  -p PARAM_FILE, --param-file PARAM_FILE
                        Parameter files to load for the controller
  --load-only           Load the controller but do not configure/activate it
  --inactive            Configure the controller but do not switch it
  --controller-ros-args CONTROLLER_ROS_ARGS
                        ROS arguments to pass to the controller
```

解析后的控制器配置文件可以遵循典型 ROS 2 参数文件格式的约定。现在 spawner 可以处理带通配符条目的配置文件，也可以处理绝对命名空间中的控制器名称。配置文件示例见下：

```yaml
/**:
  ros__parameters:
    type: joint_trajectory_controller/JointTrajectoryController

    command_interfaces:
      - position
      .....

position_trajectory_controller_joint1:
  ros__parameters:
    joints:
      - joint1

position_trajectory_controller_joint2:
  ros__parameters:
    joints:
      - joint2
```

```yaml
/**/position_trajectory_controller:
  ros__parameters:
    type: joint_trajectory_controller/JointTrajectoryController
    joints:
      - joint1
      - joint2

    command_interfaces:
      - position
      .....
```

```yaml
/position_trajectory_controller:
  ros__parameters:
    type: joint_trajectory_controller/JointTrajectoryController
    joints:
      - joint1
      - joint2

    command_interfaces:
      - position
      .....
```

```yaml
position_trajectory_controller:
  ros__parameters:
    type: joint_trajectory_controller/JointTrajectoryController
    joints:
      - joint1
      - joint2

    command_interfaces:
      - position
      .....
```

```yaml
/rrbot_1/position_trajectory_controller:
  ros__parameters:
    type: joint_trajectory_controller/JointTrajectoryController
    joints:
      - joint1
      - joint2

    command_interfaces:
      - position
      .....
```

### 1.4.2 `unspawner`

```bash
$ ros2 run controller_manager unspawner -h
usage: unspawner [-h] [-c CONTROLLER_MANAGER] [--switch-timeout SWITCH_TIMEOUT] controller_names [controller_names ...]

positional arguments:
  controller_names      Name of the controller

options:
  -h, --help            show this help message and exit
  -c CONTROLLER_MANAGER, --controller-manager CONTROLLER_MANAGER
                        Name of the controller manager ROS node
  --switch-timeout SWITCH_TIMEOUT
                        Time to wait for a successful state switch of controllers. Useful if controllers cannot be switched immediately, e.g., paused
                        simulations at startup
```

### 1.4.3 `hardware_spawner`

```bash
$ ros2 run controller_manager hardware_spawner -h
usage: hardware_spawner [-h] [-c CONTROLLER_MANAGER] [--controller-manager-timeout CONTROLLER_MANAGER_TIMEOUT] (--activate | --configure) hardware_component_names [hardware_component_names ...]

positional arguments:
  hardware_component_names
                        The name of the hardware components which should be activated.

options:
  -h, --help            show this help message and exit
  -c CONTROLLER_MANAGER, --controller-manager CONTROLLER_MANAGER
                        Name of the controller manager ROS node
  --controller-manager-timeout CONTROLLER_MANAGER_TIMEOUT
                        Time to wait for the controller manager
  --activate            Activates the given components. Note: Components are by default configured before activated.
  --configure           Configures the given components.
```

### 1.4.4 彩色输出处理

辅助脚本（`spawner` 和 `hardware_spawner`）现在使用环境感知的 `bcolors` 类。彩色输出会自动适应环境：

- `RCUTILS_COLORIZED_OUTPUT=0` → 禁用彩色输出
- `RCUTILS_COLORIZED_OUTPUT=1` → 强制启用彩色输出
- 未设置 → 自动检测 TTY，仅在交互式终端中启用彩色输出

## 1.5 实用工具脚本（Utility scripts）

除了 `spawner`、`unspawner` 和 `hardware_spawner` 辅助脚本外，controller_manager 包还提供了用于以编程方式与控制器管理器交互的工具模块。

### 1.5.1 以编程方式进行控制器生命周期管理（推荐）

在生命周期脚本中，建议优先使用 `controller_manager.controller_manager_services` 中的高层服务封装函数（如 `load_controller`、`configure_controller`、`switch_controllers`、`cleanup_controller`、`unload_controller`），而不是直接暴露内部的服务客户端单例。

**生命周期脚本示例：**

```python
import rclpy
from controller_manager.controller_manager_services import (
  load_controller, configure_controller, switch_controllers, cleanup_controller, unload_controller
)
from controller_manager_msgs.srv import SwitchController

def main():
  rclpy.init()
  node = rclpy.create_node('controller_ops')
  cm_name = 'controller_manager'
  try:
    resp = load_controller(node, cm_name, 'my_controller')
    if getattr(resp, 'success', False):
      node.get_logger().info("Controller loaded")
    resp = configure_controller(node, cm_name, 'my_controller')
    if getattr(resp, 'ok', getattr(resp, 'success', False)):
      node.get_logger().info("Controller configured")
    resp = switch_controllers(
      node, cm_name, deactivate_controllers=[], activate_controllers=['my_controller'],
      strictness=SwitchController.Request.STRICT, activate_asap=False, timeout=0.0
    )
    if getattr(resp, 'ok', False):
      node.get_logger().info('Controller activated')
  finally:
    switch_controllers(
      node, cm_name, deactivate_controllers=['my_controller'], activate_controllers=[],
      strictness=SwitchController.Request.STRICT, activate_asap=False, timeout=0.0
    )
    cleanup_controller(node, cm_name, 'my_controller')
    unload_controller(node, cm_name, 'my_controller')
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
  main()
```

说明：

- 导入路径：`controller_manager.controller_manager_services`（与仓库布局一致）。
- 不同服务的响应字段不同；示例中使用 `getattr` 处理 `success` 与 `ok` 的差异。

### 1.5.2 launch_utils

`launch_utils` 模块提供辅助函数，用于生成加载控制器的 launch 描述。这些函数通过减少样板代码来简化 launch 文件的编写。

**`generate_controllers_spawner_launch_description()`**

生成一个自动使用 spawner 工具加载并激活控制器的 launch 描述。

**函数签名：**

```python
def generate_controllers_spawner_launch_description(
  controller_names: list,
  controller_params_files=None,
  extra_spawner_args=[]
) -> LaunchDescription
```

**Python 使用示例：**

```python
from controller_manager.launch_utils import generate_controllers_spawner_launch_description
from launch import LaunchDescription
from launch.substitutions import PathSubstitution
from launch_ros.substitutions import FindPackageShare

def generate_launch_description():
  config_dir = PathSubstitution(FindPackageShare('my_robot_bringup')) / 'config'
  # Example 1: Load with controller parameters already in controller_manager
  spawner = generate_controllers_spawner_launch_description(
    ['joint_state_broadcaster']
  )
  # Example 2: Load with parameter file and extra arguments
  spawner = generate_controllers_spawner_launch_description(
    ['joint_trajectory_controller'],
    controller_params_files=[config_dir / 'controllers.yaml'],
    extra_spawner_args=['--load-only']
  )
  return spawner
```

**参数：**

- `controller_names` (list[str])：要加载的控制器的名称列表。示例：`['joint_state_broadcaster', 'joint_trajectory_controller']`
- `controller_params_files` (list, 可选)：控制器的 YAML 参数文件路径。每个元素可以是纯字符串路径或 launch 替换（如 `PathJoinSubstitution([...])`）。默认为 `None`
- `extra_spawner_args` (list[str], 可选)：传递给 spawner 的额外参数（如 `['--load-only', '--inactive']`）。默认为 `[]`

**返回值：**

返回一个包含以下内容的 `LaunchDescription`：

- 用于 `controller_manager_name` 的 launch 参数（默认："controller_manager"）——允许覆盖控制器管理器节点名
- 用于 `unload_on_kill` 的 launch 参数（默认："false"）——等待中断信号以卸载控制器
- 加载并激活指定控制器的 spawner 节点

**完整的 launch 文件示例：**

```python
from launch import LaunchDescription
from launch_ros.actions import Node
from controller_manager.launch_utils import generate_controllers_spawner_launch_description
from launch.substitutions import PathSubstitution
from launch_ros.substitutions import FindPackageShare

def generate_launch_description():
  # Get configuration paths
  config_dir = PathSubstitution(FindPackageShare('my_robot_bringup')) / 'config'
  # Create controller manager node
  control_node = Node(
    package='controller_manager',
    executable='ros2_control_node',
    parameters=[config_dir / 'ros2_controllers.yaml'],
    output='both',
  )
  # Create spawner for multiple controllers
  controllers_spawner = generate_controllers_spawner_launch_description(
    ['joint_state_broadcaster', 'joint_trajectory_controller'],
    controller_params_files=[config_dir / 'controllers.yaml'],
  )
  return LaunchDescription([
    control_node,
    controllers_spawner,
  ])
```

**启动：**

```bash
$ ros2 launch my_robot_bringup my_robot.launch.py
[controller_manager-1] [INFO] [ros2_control_node]: Loaded controller 'joint_state_broadcaster'
[spawner-1] [INFO] [spawner]: Configured and activated 'joint_state_broadcaster'
[spawner-1] [INFO] [spawner]: Configured and activated 'joint_trajectory_controller'
```

**`generate_controllers_spawner_launch_description_from_dict()`**

提供使用字典格式指定控制器的替代方式，允许为每个控制器使用不同的参数文件。

**函数签名：**

```python
def generate_controllers_spawner_launch_description_from_dict(
  controller_info_dict: dict,
  extra_spawner_args=[]
) -> LaunchDescription
```

**参数：**

- `controller_info_dict` (dict[str, str | list[str] | None])：以控制器名称为键、参数文件路径为值的字典。每个值可以是 `str`（单个 YAML）、`list[str]`（按顺序应用的多个 YAML）、`[]`（无参数文件）或 `None`（不需要参数文件）
- `extra_spawner_args` (list[str], 可选)：传递给 spawner 的额外参数。默认为 `[]`

**Python 使用示例：**

```python
from controller_manager.launch_utils import generate_controllers_spawner_launch_description_from_dict
from launch import LaunchDescription
from launch.substitutions import PathSubstitution
from launch_ros.substitutions import FindPackageShare

def generate_launch_description():
  config_dir = PathSubstitution(FindPackageShare('my_robot_bringup')) / 'config'
  # Define controllers with per-controller configurations
  controller_info_dict = {
    'joint_state_broadcaster': config_dir / 'common_params.yaml',
    'position_trajectory_controller': [
      config_dir / 'common_params.yaml',
      config_dir / 'position_controller.yaml',
    ],
    'velocity_trajectory_controller': config_dir / 'velocity_controller.yaml',
  }
  spawner = generate_controllers_spawner_launch_description_from_dict(
    controller_info_dict,
    extra_spawner_args=['--load-only']
  )
  return LaunchDescription([spawner])
```

**使用场景：**

- 为不同控制器定义不同的参数文件
- 在多个控制器之间应用公共参数文件
- 使用多个 YAML 文件覆盖控制器参数
- 简化复杂的 launch 文件配置

## 1.6 rqt_controller_manager

一个用于与控制器管理器服务交互的 GUI 工具，可切换控制器以及硬件组件的生命周期状态。
![rqt_controller_manager 界面](https://lux2026.oss-cn-hangzhou.aliyuncs.com/images/ros2_control/controller_manager/rqt_controller_manager.png)


可以使用以下命令独立启动，或作为 rqt 插件使用：

```bash
ros2 run rqt_controller_manager rqt_controller_manager
```

- 双击某个控制器或硬件组件以显示附加信息。
- 右键点击某个控制器或硬件组件，可弹出包含生命周期管理选项的上下文菜单。

## 1.7 操作（Operations）

### 1.7.1 重启所有控制器

重启所有控制器最简单的方式是使用 `switch_controllers` 服务或 CLI，将全部控制器加入 `start` 和 `stop` 列表。注意并非所有控制器都必须重启，例如广播器（broadcasters）。

### 1.7.2 重启硬件

如果硬件被重启，则应重新走一遍其生命周期，以重新配置并导出接口。

### 1.7.3 硬件与控制器错误

如果硬件在其 `read` 或 `write` 方法中返回 `return_type::ERROR`，控制器管理器将停止所有使用该硬件命令接口和状态接口的控制器。同样地，如果某个控制器从其 `update` 方法返回 `return_type::ERROR`，控制器管理器将停用该控制器（或其所属的整个控制器链），然后尝试启动任何可用的备用（fallback）控制器。

---
title: "ros2_control 核心框架官方文档（Jazzy 版）中文翻译"
published: 2026-08-31
description: "ros2_control 框架核心文档中文翻译，涵盖 Controller Manager、Concepts、Hardware Components、Guidelines and Best Practices 等章节。"
image: ""
tags: ["ROS2", "机器人", "ros2_control", "翻译"]
category: ROS2专题
slug: ros2_control-core-framework
series: "ROS2-Control 官方文档中文翻译"
seriesOrder: 1
draft: false
lang: "zh-CN"
---

> **原文地址**：<https://control.ros.org/jazzy/doc/ros2_control/doc/index.html>
> **原文版本**：ROS 2 Jazzy（较旧但仍受支持的版本，最新版见 Kilted）
> **翻译说明**：本文为 ros2_control 框架核心文档的中文翻译，涵盖「Controller Manager」「Concepts」「Hardware Components」「Guidelines and Best Practices」等章节。为保证可读性与准确性：正文与说明性文字译为中文；代码、命令、参数名、消息类型、ROS 标识符等保留原文；关键术语在首次出现时标注英文原文。
> **原文档仓库**：<https://github.com/ros-controls/ros2_control>

---

## 目录

1. [Controller Manager（控制器管理器）](#1-controller-manager控制器管理器)
2. [Concepts（概念）](#2-concepts概念)
   - 2.1 [Controller Chaining / Cascade Control（控制器级联/串级控制）](#21-controller-chaining--cascade-control控制器级联串级控制)
   - 2.2 [Joint Kinematics（关节运动学）](#22-joint-kinematics关节运动学)
   - 2.3 [Joint Limiting（关节限位）](#23-joint-limiting关节限位)
   - 2.4 [Support for Asynchronous Updates（异步更新支持）](#24-support-for-asynchronous-updates异步更新支持)
   - 2.5 [Different Clocks used by Controller Manager（控制器管理器使用的不同时钟）](#25-different-clocks-used-by-controller-manager控制器管理器使用的不同时钟)
3. [Hardware Components（硬件组件）](#3-hardware-components硬件组件)
   - 3.1 [Hardware Interface Types（硬件接口类型）](#31-hardware-interface-types硬件接口类型)
   - 3.2 [Writing a Hardware Component（编写硬件组件）](#32-writing-a-hardware-component编写硬件组件)
   - 3.3 [Different Update Rates（不同的更新频率）](#33-different-update-rates不同的更新频率)
   - 3.4 [Asynchronous Execution（异步执行）](#34-asynchronous-execution异步执行)
   - 3.5 [Semantic Components（语义组件）](#35-semantic-components语义组件)
   - 3.6 [Mock Components（模拟组件）](#36-mock-components模拟组件)
   - 3.7 [Lifecycle of a Hardware Component（硬件组件的生命周期）](#37-lifecycle-of-a-hardware-component硬件组件的生命周期)
   - 3.8 [Handling of Errors During read() and write() Calls（read() 与 write() 调用期间的错误处理）](#38-handling-of-errors-during-read-and-write-callsread-与-write-调用期间的错误处理)
4. [Guidelines and Best Practices（指南与最佳实践）](#4-guidelines-and-best-practices指南与最佳实践)
   - 4.1 [Debugging the Controller Manager and Plugins（调试控制器管理器与插件）](#41-debugging-the-controller-manager-and-plugins调试控制器管理器与插件)
   - 4.2 [Introspection of the ros2_control setup（ros2_control 配置的观测）](#42-introspection-of-the-ros2_control-setupros2_control-配置的观测)

---

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


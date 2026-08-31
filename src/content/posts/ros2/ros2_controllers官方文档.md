---
title: "ros2_controllers 官方文档（Jazzy 版）中文翻译"
published: 2026-08-31
description: "ros2_controllers 官方文档中文翻译，涵盖轮式移动机器人控制器、机械臂控制器、广播器、滤波器等全部通用控制器集。"
image: ""
tags: ["ROS2", "机器人", "ros2_control", "ros2_controllers", "控制器", "翻译"]
category: ROS2专题
slug: ros2_controllers-official-docs
series: "ROS2-Control 官方文档中文翻译"
seriesOrder: 2
draft: false
lang: "zh-CN"
---

> **原文地址**：<https://control.ros.org/jazzy/doc/ros2_controllers/doc/controllers_index.html>
> **原文版本**：ROS 2 Jazzy（较旧但仍受支持的版本，最新版见 Kilted）
> **翻译说明**：本文为 ros2_control 框架中 **ros2_controllers**（通用控制器集）官方文档的中文翻译，涵盖指南与最佳实践、轮式移动机器人控制器、机械臂及其他机器人控制器、广播器、滤波器、公共控制器参数等全部技术章节。处理方式：正文与说明文字译为中文；代码、命令、参数名、消息类型、ROS 标识符、数学公式保留原文；关键术语在首次出现时标注英文原文。
> **原文档仓库**：<https://github.com/ros-controls/ros2_controllers>

---

## 目录

1. [简介与文档结构](#1-简介与文档结构)
2. [指南与最佳实践（Guidelines and Best Practices）](#2-指南与最佳实践guidelines-and-best-practices)
   - 2.1 [轮式移动机器人运动学（Wheeled Mobile Robot Kinematics）](#21-轮式移动机器人运动学wheeled-mobile-robot-kinematics)
   - 2.2 [编写新控制器（Writing a new controller）](#22-编写新控制器writing-a-new-controller)
3. [轮式移动机器人控制器（Controllers for Wheeled Mobile Robots）](#3-轮式移动机器人控制器controllers-for-wheeled-mobile-robots)
   - 3.1 [差速驱动控制器（Differential Drive Controller）](#31-差速驱动控制器differential-drive-controller)
   - 3.2 [麦克纳姆轮驱动控制器（Mecanum Drive Controllers）](#32-麦克纳姆轮驱动控制器mecanum-drive-controllers)
   - 3.3 [全向轮驱动控制器（Omni Wheel Drive Controller）](#33-全向轮驱动控制器omni-wheel-drive-controller)
   - 3.4 [转向控制器库（Steering Controllers Library）](#34-转向控制器库steering-controllers-library)
   - 3.5 [三轮车控制器（Tricycle Controller）](#35-三轮车控制器tricycle-controller)
4. [机械臂及其他机器人控制器（Controllers for Manipulators and Other Robots）](#4-机械臂及其他机器人控制器controllers-for-manipulators-and-other-robots)
   - 4.1 [导纳控制器（Admittance Controller）](#41-导纳控制器admittance-controller)
   - 4.2 [力控制器（Effort Controllers）](#42-力控制器effort-controllers)
   - 4.3 [前向命令控制器（Forward Command Controller）](#43-前向命令控制器forward-command-controller)
   - 4.4 [夹爪控制器（Gripper Controller）](#44-夹爪控制器gripper-controller)
   - 4.5 [GPIO 命令控制器（Gpio Command Controller）](#45-gpio-命令控制器gpio-command-controller)
   - 4.6 [关节轨迹控制器（Joint Trajectory Controller）](#46-关节轨迹控制器joint-trajectory-controller)
   - 4.7 [运动基元控制器（Motion Primitive Controller）](#47-运动基元控制器motion-primitive-controller)
   - 4.8 [平行夹爪控制器（Parallel Gripper Controller）](#48-平行夹爪控制器parallel-gripper-controller)
   - 4.9 [PID 控制器](#49-pid-控制器)
   - 4.10 [位置控制器（Position Controllers）](#410-位置控制器position-controllers)
   - 4.11 [速度控制器（Velocity Controllers）](#411-速度控制器velocity-controllers)
5. [广播器（Broadcasters）](#5-广播器broadcasters)
   - 5.1 [力/力矩传感器广播器（Force Torque Sensor Broadcaster）](#51-力力矩传感器广播器force-torque-sensor-broadcaster)
   - 5.2 [扳手变换节点（Wrench Transformer Node）](#52-扳手变换节点wrench-transformer-node)
   - 5.3 [IMU 传感器广播器（IMU Sensor Broadcaster）](#53-imu-传感器广播器imu-sensor-broadcaster)
   - 5.4 [关节状态广播器（Joint State Broadcaster）](#54-关节状态广播器joint-state-broadcaster)
   - 5.5 [测距传感器广播器（Range Sensor Broadcaster）](#55-测距传感器广播器range-sensor-broadcaster)
   - 5.6 [位姿广播器（Pose Broadcaster）](#56-位姿广播器pose-broadcaster)
   - 5.7 [GPS 传感器广播器（GPS Sensor Broadcaster）](#57-gps-传感器广播器gps-sensor-broadcaster)
   - 5.8 [状态接口广播器（State Interfaces Broadcaster）](#58-状态接口广播器state-interfaces-broadcaster)
   - 5.9 [磁力计广播器（Magnetometer Broadcaster）](#59-磁力计广播器magnetometer-broadcaster)
   - 5.10 [电池状态广播器（Battery State Broadcaster）](#510-电池状态广播器battery-state-broadcaster)
6. [滤波器（Filters）](#6-滤波器filters)
   - 6.1 [链式滤波控制器（Chained Filter Controller）](#61-链式滤波控制器chained-filter-controller)
7. [公共控制器参数（Common Controller Parameters）](#7-公共控制器参数common-controller-parameters)

---

# 1. 简介与文档结构

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/doc/controllers_index.html>

**ros2_controllers** 是为 ros2_control 框架提供的常用、通用化控制器集合，可直接用于许多机器人、MoveIt2 和 Nav2。

- GitHub 仓库链接：<https://github.com/ros-controls/ros2_controllers>

## 文档结构

**指南与最佳实践（Guidelines and Best Practices）**

- 轮式移动机器人运动学（Wheeled Mobile Robot Kinematics）
- 编写新控制器（Writing a new controller）

**轮式移动机器人控制器（Controllers for Wheeled Mobile Robots）**

- 差速驱动控制器（Differential Drive Controller）
- 麦克纳姆轮驱动控制器（Mecanum Drive Controllers）
- 全向轮驱动控制器（Omni Wheel Drive Controller）
- 转向控制器库（Steering Controllers Library）
  - Bicycle（自行车）
  - Tricycle（三轮车）
  - Ackermann（阿克曼）
- 三轮车控制器（Tricycle Controller）

**机械臂及其他机器人控制器（Controllers for Manipulators and Other Robots）**

这些控制器使用通用的硬件接口定义，并根据以下命令接口类型使用不同的命名空间：

- `position_controllers`：`hardware_interface::HW_IF_POSITION`
- `velocity_controller`：`hardware_interface::HW_IF_VELOCITY`
- `effort_controllers`：`hardware_interface::HW_IF_ACCELERATION`
- `effort_controllers`：`hardware_interface::HW_IF_EFFORT`

- 导纳控制器（Admittance Controller）
- 力控制器（Effort Controllers）
- 前向命令控制器（Forward Command Controller）
- 夹爪控制器（Gripper Controller）
- GPIO 命令控制器（Gpio Command Controller）
- 关节轨迹控制器（Joint Trajectory Controller）
  - 轨迹表示（Trajectory Representation）
  - 轨迹替换（Trajectory Replacement）
  - 取消时减速（Decelerate on cancel）
  - 速度缩放（Speed scaling）
  - joint_trajectory_controller 参数
  - rqt_joint_trajectory_controller
- 运动基元控制器（Motion Primitive Controller）
- 平行夹爪控制器（Parallel Gripper Controller）
- PID 控制器
- 位置控制器（Position Controllers）
- 速度控制器（Velocity Controllers）

**广播器（Broadcasters）**

广播器用于将硬件组件的传感器数据发布到 ROS 话题。在 ros2_control 的意义上，广播器仍然是与上述其他控制器使用相同控制器接口的控制器。

- 力/力矩传感器广播器（Force Torque Sensor Broadcaster）
- 扳手变换节点（Wrench Transformer Node）
- IMU 传感器广播器（IMU Sensor Broadcaster）
- 关节状态广播器（Joint State Broadcaster）
- 测距传感器广播器（Range Sensor Broadcaster）
- 位姿广播器（Pose Broadcaster）
- GPS 传感器广播器（GPS Sensor Broadcaster）
- 状态接口广播器（State Interfaces Broadcaster）
- 磁力计广播器（Magnetometer Broadcaster）
- 电池状态广播器（Battery State Broadcaster）

**滤波器（Filters）**

用于过滤状态接口的可链式（chainable）控制器。它们将过滤后的值导出为状态接口，可被其他控制器或广播器使用，并且不向 ROS 话题发布。

- 链式滤波控制器（Chained Filter Controller）

**公共控制器参数（Common Controller Parameters）**

每个控制器和广播器都有一些公共参数。它们是可选的，但如有需要，必须在 `onConfigure` 转换到 `inactive` 状态之前设置，参见生命周期文档。当控制器已加载后，此转换通过 controller_manager 的 `configure_controller` 服务完成。

- `update_rate`：一个无符号整数参数，表示每个控制器/广播器运行其更新周期的频率。未指定时，它们以与 controller_manager 相同的频率运行。
- `is_async`：一个布尔参数，用于指定控制器更新是否需要异步运行。

---

# 2. 指南与最佳实践（Guidelines and Best Practices）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/doc/>

## 2.1 轮式移动机器人运动学（Wheeled Mobile Robot Kinematics）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/doc/mobile_robot_kinematics.html>

本页介绍不同轮式移动机器人的运动学。进一步参考资料：Siciliano 等的 *Robotics: Modelling, Planning and Control* 以及 Kevin M. Lynch 和 Frank C. Park 的 *Modern Robotics: Mechanics, Planning, And Control*。

轮式移动机器人可分为两类：

**全向机器人（Omnidirectional robots）**

能够在平面内瞬时向任意方向移动。

**非完整约束机器人（Nonholonomic robots）**

不能在平面内瞬时向任意方向移动。

利用轮式执行器的编码器对运动学模型进行正向积分，被称为**里程计定位（odometric localization）**、**被动定位（passive localization）**或**航位推算（dead reckoning）**。本文中我们直接称之为**里程计（odometry）**。

### 2.1.1 全向轮式移动机器人

#### 使用全向轮（Omni Wheels）的全向驱动机器人

下面解释使用 3 个或更多全向轮的全向驱动机器人的运动学。它遵循 ROS REP 103 中定义的坐标约定。
![全向轮全向驱动机器人](https://lux2026.oss-cn-hangzhou.aliyuncs.com/images/ros2_controllers/kinematics/omni_wheel_omnidirectional_drive.svg)


- \\(x_b,y_b\\) 是机器人机体坐标系，位于轮子与地面的接触点。
- \\(x_w,y_w\\) 是世界坐标系。
- \\(v_{b,x}\\) 是机器人在 x 轴上的线速度。
- \\(v_{b,y}\\) 是机器人在 y 轴上的线速度。
- \\(\omega_{b,z}\\) 是机器人在 z 轴上的角速度。
- \\(R\\) 是机器人的半径 / 机器人中心到轮子的距离。
- 轮子 \\(i\\) 上的红色箭头表示其旋转的正方向 \\(\omega_i\\)。
- \\(\gamma\\) 是第一个轮子相对 \\(x_b\\) 的角度偏移。
- \\(\theta\\) 是每个轮子之间的角度，可用下式计算，其中 \\(n\\) 是轮子数量。

\\[\theta = \frac{2\pi}{n}\\]

**逆运动学（Inverse Kinematics）**

为实现期望的机体速度旋量（body twist），所需的轮子角速度可用以下矩阵计算：

\\[\begin{split}A = \begin{bmatrix} \sin(\gamma) & -\cos(\gamma) & -R \\ \sin(\theta + \gamma) & -\cos(\theta + \gamma) & -R\\ \sin(2\theta + \gamma) & -\cos(2\theta + \gamma) & -R\\ \sin(3\theta + \gamma) & -\cos(3\theta + \gamma) & -R\\ \vdots & \vdots & \vdots\\ \sin((n-1)\theta + \gamma) & -\cos((n-1)\theta + \gamma) & -R\\ \end{bmatrix}\end{split}\\]

\\[\begin{split}\begin{bmatrix} \omega_1\\ \omega_2\\ \omega_3\\ \omega_4\\ \vdots\\ \omega_n \end{bmatrix} = \frac{1}{r} A \begin{bmatrix} v_{b,x}\\ v_{b,y}\\ \omega_{b,z}\\ \end{bmatrix}\end{split}\\]

这里 \\(\omega_1,\ldots,\omega_n\\) 是轮子的角速度，\\(r\\) 是轮子的半径。这些方程可以对任意轮子 \\(i\\) 写成如下代数形式：

\\[\omega_i = \frac{\sin((i-1)\theta + \gamma) v_{b,x} - \cos((i-1)\theta + \gamma) v_{b,y} - R \omega_{b,z}}{r}\\]

**正运动学（Forward Kinematics）**

机器人的机体速度旋量可由轮速通过矩阵 \\(A\\) 的伪逆获得：

\\[\begin{split}\begin{bmatrix} v_{b,x}\\ v_{b,y}\\ \omega_{b,z}\\ \end{bmatrix} = rA^\dagger \begin{bmatrix} \omega_1\\ \omega_2\\ \omega_3\\ \omega_4\\ \vdots\\ \omega_n \end{bmatrix}\end{split}\\]

#### 滑移转向驱动机器人（Swerve Drive Robots）

下面解释使用四个滑移模块（每个模块具有独立控制的转向电机和驱动电机）的全向驱动机器人的运动学。它遵循 REP-103 定义的坐标约定。
![Swerve 滑移转向驱动机器人](https://lux2026.oss-cn-hangzhou.aliyuncs.com/images/ros2_controllers/kinematics/swerve_drive.svg)


- \\(x_b, y_b\\) 是机器人机体坐标系，位于机器人的几何中心。
- \\(x_w, y_w\\) 是世界坐标系。
- \\(v_{b,x}\\) 是机器人在 x 轴上的线速度。
- \\(v_{b,y}\\) 是机器人在 y 轴上的线速度。
- \\(\omega_{b,z}\\) 是机器人在 z 轴上的角速度。
- \\(l\\) 是轴距（wheelbase，前后轮之间的距离）。
- \\(w\\) 是轮距（track width，左右轮之间的距离）。
- 轮子 \\(i\\) 上的红色箭头表示该轮速度 \\(v_i\\) 的方向。

每个滑移模块 \\(i\\)（\\(i = 0, 1, 2, 3\\)，通常为左前、右前、左后、右后）位于相对中心的 \\((l_{i,x}, l_{i,y})\\) 处，典型位置为：

- 左前：\\((l/2, w/2)\\)
- 右前：\\((l/2, -w/2)\\)
- 左后：\\((-l/2, w/2)\\)
- 右后：\\((-l/2, -w/2)\\)

**逆运动学**

对位于 \\((l_{i,x}, l_{i,y})\\) 的每个模块 \\(i\\)，其速度矢量为：

\\[\begin{split}\begin{bmatrix} v_{i,x} \\ v_{i,y} \end{bmatrix} = \begin{bmatrix} v_{b,x} - \omega_{b,z} l_{i,y} \\ v_{b,y} + \omega_{b,z} l_{i,x} \end{bmatrix}\end{split}\\]

轮速 \\(v_i\\) 和转向角 \\(\phi_i\\) 为：

\\[v_i = \sqrt{v_{i,x}^2 + v_{i,y}^2}\\]

\\[\phi_i = \arctan2(v_{i,y}, v_{i,x})\\]

**里程计**

机器人的机体速度旋量由轮速 \\(v_i\\) 和转向角 \\(\phi_i\\) 计算得到。每个模块在机体坐标系中的速度分量为：

\\[v_{i,x} = v_i \cos(\phi_i), \quad v_{i,y} = v_i \sin(\phi_i)\\]

底盘速度计算如下：

\\[v_{b,x} = \frac{1}{4} \sum_{i=0}^{3} v_{i,x}, \quad v_{b,y} = \frac{1}{4} \sum_{i=0}^{3} v_{i,y}\\]

\\[\omega_{b,z} = \frac{\sum_{i=0}^{3} (v_{i,y} l_{i,x} - v_{i,x} l_{i,y})}{\sum_{i=0}^{3} (l_{i,x}^2 + l_{i,y}^2)}\\]

里程计使用计算出的底盘速度在全局坐标系中更新机器人的位姿（\\(x\\)、\\(y\\)、\\(\theta\\)）。全局速度为：

\\[v_{x,\text{global}} = v_{b,x} \cos(\theta) - v_{b,y} \sin(\theta)\\]

\\[v_{y,\text{global}} = v_{b,x} \sin(\theta) + v_{b,y} \cos(\theta)\\]

### 2.1.2 非完整约束轮式移动机器人

#### 单轮模型（Unicycle model）

为定义坐标系（ROS 坐标帧约定，坐标系遵循右手定则），考虑如下简单的单轮模型：
![单轮模型](https://lux2026.oss-cn-hangzhou.aliyuncs.com/images/ros2_controllers/kinematics/unicycle.svg)


- \\(x_b,y_b\\) 是机器人机体坐标系，位于轮子与地面的接触点。
- \\(x_w,y_w\\) 是世界坐标系。
- \\(x,y\\) 是机器人在世界坐标系中的笛卡尔坐标。
- \\(\theta\\) 是机器人的航向角，即机器人 \\(x_b\\) 轴相对世界 \\(x_w\\) 轴的方向。

接下来，我们希望以期望的机体速度旋量来命令机器人：

\\[\begin{split}\vec{\nu}_b = \begin{bmatrix} \vec{\omega}_{b} \\ \vec{v}_{b} \end{bmatrix},\end{split}\\]

其中 \\(\vec{v}_{b}\\) 是机器人在其机体坐标系中的线速度，\\(\vec\omega_{b}\\) 是机器人在其机体坐标系中的角速度。由于我们考虑在平坦表面上转向的机器人，给出以下输入即可：

- \\(v_{b,x}\\)，即机器人沿 \\(x_b\\) 轴方向的线速度。
- \\(\omega_{b,z}\\)，即机器人绕 \\(x_z\\) 轴的角速度。

作为期望的系统输入。单轮模型的正运动学可计算如下：

\\[\begin{split}\dot{x} &= v_{b,x} \cos(\theta) \\ \dot{y} &= v_{b,x} \sin(\theta) \\ \dot{\theta} &= \omega_{b,z}\end{split}\\]

我们将建立逆运动学，以根据给定的机体速度旋量计算机器人的期望命令（轮速或转向角）。

#### 差速驱动机器人（Differential Drive Robot）

引用 Siciliano 等的 *Robotics: Modelling, Planning and Control*：

> 严格意义上的单轮车（即装备单个轮子的车辆）在静态条件下存在严重的平衡问题。然而，存在一些在运动学上等价于单轮车、但在力学上更稳定的车辆。

其中一种车辆就是差速驱动机器人，它有两个轮子，每个轮子独立驱动。
![差速驱动机器人](https://lux2026.oss-cn-hangzhou.aliyuncs.com/images/ros2_controllers/kinematics/diff_drive.svg)


- \\(w\\) 是轮距（wheel track，两轮之间的距离）。

**正运动学**

差速驱动模型的正运动学可由上面的单轮模型计算：

\\[\begin{split}v_{b,x} &= \frac{v_{right} + v_{left}}{2} \\ \omega_{b,z} &= \frac{v_{right} - v_{left}}{w}\end{split}\\]

**逆运动学**

实现期望机体速度旋量所需的轮速可计算如下：

\\[\begin{split}v_{left} &= v_{b,x} - \omega_{b,z} w / 2 \\ v_{right} &= v_{b,x} + \omega_{b,z} w / 2\end{split}\\]

**里程计**

我们可以使用上面的正运动学方程直接从编码器读数计算机器人的里程计。

#### 类车（自行车）模型（Car-Like (Bicycle) Model）

下图展示了一个两轮的类车机器人，其前轮可转向。该模型也称为自行车模型。
![类车（自行车）模型](https://lux2026.oss-cn-hangzhou.aliyuncs.com/images/ros2_controllers/kinematics/car_like_robot.svg)


- \\(\phi\\) 是前轮的转向角，绕 \\(x_z\\) 轴旋转的方向为正。
- \\(v_{rear}, v_{front}\\) 是后轮和前轮的速度。
- \\(l\\) 是轴距（wheelbase）。

我们假设轮子无滑动地滚动。这意味着轮子与地面接触点的速度为零，轮子的速度方向垂直于轮轴方向。**瞬时旋转中心**（Instantaneous Center of Rotation, ICR），即机器人绕其旋转的圆心，位于垂直于各轮轴且通过轮子与地面接触点的直线的交点处。

由于无滑动条件，两个轮子的速度必须满足如下约束：

\\[v_{rear} = v_{front} \cos(\phi)\\]

**正运动学**

类车模型的正运动学可计算如下：

\\[\begin{split}\dot{x} &= v_{b,x} \cos(\theta) \\ \dot{y} &= v_{b,x} \sin(\theta) \\ \dot{\theta} &= \frac{v_{b,x}}{l} \tan(\phi)\end{split}\\]

**逆运动学**

转向角是机器人的一个命令输入：

\\[\phi = \arctan\left(\frac{l w_{b,z}}{v_{b,x}} \right)\\]

对于后轮驱动，后轮速度是机器人的第二个输入：

\\[v_{rear} = v_{b,x}\\]

对于前轮驱动，前轮速度是机器人的第二个输入：

\\[v_{front} = \frac{v_{b,x}}{\cos(\phi)}\\]

**里程计**

我们必须区分两种情况：编码器在后轮或在前轮。

对于后轮的情况：

\\[\begin{split}\dot{x} &= v_{rear} \cos(\theta) \\ \dot{y} &= v_{rear} \sin(\theta) \\ \dot{\theta} &= \frac{v_{rear}}{l} \tan(\phi)\end{split}\\]

对于前轮的情况：

\\[\begin{split}\dot{x} &= v_{front} \cos(\theta) \cos(\phi)\\ \dot{y} &= v_{front} \sin(\theta) \cos(\phi)\\ \dot{\theta} &= \frac{v_{front}}{l} \sin(\phi)\end{split}\\]

#### 双牵引轴（Double-Traction Axle）

下图展示了一个三轮的类车机器人，后部有两个独立的牵引轮。
![双牵引轴模型](https://lux2026.oss-cn-hangzhou.aliyuncs.com/images/ros2_controllers/kinematics/double_traction.svg)


- \\(w_r\\) 是后轴的轮距。

**正运动学**

正运动学与上面的类车模型相同。

**逆运动学**

机器人的转弯半径为：

\\[R_b = \frac{l}{\tan(\phi)}\\]

为避免打滑，后轮速度必须满足以下条件：

\\[\begin{split}v_{rear,left} &= v_{b,x}\frac{R_b - w_r/2}{R_b}\\ v_{rear,right} &= v_{b,x}\frac{R_b + w_r/2}{R_b}\end{split}\\]

**里程计**

由牵引轴的两个编码器测量值计算 \\(v_{b,x}\\) 是超定（overdetermined）的。如果无滑动且编码器理想，则：

\\[v_{b,x} = v_{rear,left} \frac{R_b}{R_b - w_r/2} = v_{rear,right} \frac{R_b}{R_b + w_r/2}\\]

成立。但为得到更鲁棒的解，我们取两者的平均值，即：

\\[v_{b,x} = 0.5 \left(v_{rear,left} \frac{R_b}{R_b - w_r/2} + v_{rear,right} \frac{R_b}{R_b + w_r/2}\right).\\]

#### 阿克曼转向（Ackermann Steering）

下图展示了一个四轮机器人，前部有两个独立转向轮。
![阿克曼转向模型](https://lux2026.oss-cn-hangzhou.aliyuncs.com/images/ros2_controllers/kinematics/ackermann_steering.svg)


- \\(w_f\\) 是前轴的轮距，在两个主销（kingpin）之间测量。

为防止前轮打滑，前轮的转向角不能相等。这就是所谓的**阿克曼转向（Ackermann steering）**。

> **注意**
>
> 阿克曼转向也可以通过两个前轮之间的机械连杆实现。在这种情况下，机器人只有一个转向输入，两个前轮的转向角机械耦合。此时机器人的逆运动学与上面的类车模型相同。

**正运动学**

正运动学与上面的类车模型相同。

**逆运动学**

机器人的转弯半径为：

\\[R_b = \frac{l}{\tan(\phi)}\\]

为避免打滑，前轮转向角必须满足以下条件：

\\[\begin{split}\phi_{left} &= \arctan\left(\frac{l}{R_b - w_f/2}\right) = \arctan\left(\frac{2l\sin(\phi)}{2l\cos(\phi) - w_f\sin(\phi)}\right)\\ \phi_{right} &= \arctan\left(\frac{l}{R_b + w_f/2}\right) = \arctan\left(\frac{2l\sin(\phi)}{2l\cos(\phi) + w_f\sin(\phi)}\right)\end{split}\\]

**里程计**

由转向轴的两个角度测量值计算 \\(\phi\\) 是超定的。如果无滑动且测量理想，则：

\\[\phi = \arctan\left(\frac{l\tan(\phi_{left})}{l + w_f/2 \tan(\phi_{left})}\right) = \arctan\left(\frac{l\tan(\phi_{right})}{l - w_f/2 \tan(\phi_{right})}\right)\\]

成立。但为得到更鲁棒的解，我们取两者的平均值，即：

\\[\phi = 0.5 \left(\arctan\left(\frac{l\tan(\phi_{left})}{l + w_f/2 \tan(\phi_{left})}\right) + \arctan\left(\frac{l\tan(\phi_{right})}{l - w_f/2 \tan(\phi_{right})}\right)\right).\\]

#### 带牵引的阿克曼转向（Ackermann Steering with Traction）

下图展示了一个四轮的类车机器人，前部有两个独立转向轮，同时这两个轮也独立驱动。
![带牵引的阿克曼转向模型](https://lux2026.oss-cn-hangzhou.aliyuncs.com/images/ros2_controllers/kinematics/ackermann_steering_traction.svg)


- \\(d_{kp}\\) 是主销到前轮与地面接触点的距离。

**正运动学**

正运动学与上面的类车模型相同。

**逆运动学**

为避免前轮打滑，前轮的速度不能相等，且：

\\[\frac{v_{front,left}}{R_{left}} = \frac{v_{front,right}}{R_{right}} = \frac{v_{b,x}}{R_b}\\]

其中机器人与左/右前轮的转弯半径为：

\\[\begin{split}R_b &= \frac{l}{\tan(\phi)} \\ R_{left} &= \frac{l-d_{kp}\sin(\phi_{left})}{\sin(\phi_{left})}\\ R_{right} &= \frac{l+d_{kp}\sin(\phi_{right})}{\sin(\phi_{right})}.\end{split}\\]

这得到如下逆运动学方程：

\\[\begin{split}v_{front,left} &= \frac{v_{b,x}(l-d_{kp}\sin(\phi_{left}))}{R_b\sin(\phi_{left})}\\ v_{front,right} &= \frac{v_{b,x}(l+d_{kp}\sin(\phi_{right}))}{R_b\sin(\phi_{right})}\end{split}\\]

其中前轮转向角来自上面的阿克曼转向方程。

**里程计**

由牵引轴的两个编码器测量值计算 \\(v_{b,x}\\) 同样是超定的。如果无滑动且编码器理想，则：

\\[v_{b,x} = v_{front,left} \frac{R_b\sin(\phi_{left})}{l-d_{kp}\sin(\phi_{left})} = v_{front,right} \frac{R_b\sin(\phi_{right})}{l+d_{kp}\sin(\phi_{right})}\\]

成立。但为得到更鲁棒的解，我们取两者的平均值，即：

\\[v_{b,x} = 0.5 \left( v_{front,left} \frac{R_b\sin(\phi_{left})}{l-d_{kp}\sin(\phi_{left})} + v_{front,right} \frac{R_b\sin(\phi_{right})}{l+d_{kp}\sin(\phi_{right})}\right).\\]

---

## 2.2 编写新控制器（Writing a new controller）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/doc/writing_new_controller.html>

在此框架中，控制器是库，由控制器管理器通过 pluginlib 接口动态加载。以下是创建新控制器的源文件、基础测试和编译规则的逐步指南。

**1. 准备包（Preparing package）**

如果控制器的包不存在，请先创建它。该包应使用 `ament_cmake` 作为构建类型。通常，你可以使用 `ros2 pkg create <controller_name_package> --build-type ament_cmake`。使用 `--help` 标志可了解该命令的更多用法。该命令还提供创建库源文件和编译规则的选项，可帮助完成后续步骤。

**2. 准备源文件（Preparing source files）**

创建包之后，其中至少应有 `CMakeLists.txt` 和 `package.xml` 文件。如果 `include/<PACKAGE_NAME>/` 和 `src` 文件夹不存在，请一并创建。在 `include/<PACKAGE_NAME>/` 文件夹中添加 `<controller_name>.hpp`，在 `src` 文件夹中添加 `<controller_name>.cpp`。

**3. 在头文件（.hpp）中添加声明**

1. 注意使用头文件保护。ROS 2 风格是使用 `#ifndef` 和 `#define` 预处理指令。
2. 包含 `"controller_interface/controller_interface.hpp"`。
3. 为你的控制器定义一个唯一的命名空间。这通常是使用 `snake_case` 书写的包名。
4. 定义控制器的类，继承 `ControllerInterface`。现在，你的代码应该类似这样：

```cpp
#ifndef <CONTROLLER_NAME>_HPP_
#define <CONTROLLER_NAME>_HPP_

#include "controller_interface/controller_interface.hpp"

namespace <controller_name>
{

class ControllerName : public controller_interface::ControllerInterface
{
  // ...
};

}  // namespace <controller_name>

#endif  // <CONTROLLER_NAME>_HPP_
```

5. 添加一个无参构造函数，以及以下重写 `ControllerInterface` 定义的公有方法：`on_init`、`command_interface_configuration`、`state_interface_configuration`、`on_configure`、`on_activate`、`on_deactivate`、`update`。确切定义请查看 `controller_interface/controller_interface.hpp` 头文件或 ros2_controllers 中的某个控制器。
6. （可选）可以通过重写默认方法 `define_custom_node_options` 来自定义 LifecycleNode 的 NodeOptions。
7. （可选）通常，控制器会接受关节名称列表和接口名称列表作为参数。如果是这样，你可以添加两个受保护的字符串向量来存储这些值。

**4. 在源文件（.cpp）中添加定义**

1. 包含控制器的头文件，并添加命名空间定义以简化后续开发。
2. （可选）如有需要，实现构造函数。在此可以初始化成员变量。这也可以在 `on_init` 方法中完成。
3. 实现 `on_init` 方法。第一行通常调用父类的 `on_init` 方法。这里是初始化变量、预留内存，以及最重要的是声明控制器使用的节点参数的最佳位置。如果一切正常，返回 `controller_interface::CallbackReturn::SUCCESS`；否则返回 `controller_interface::CallbackReturn::ERROR`。
4. 编写 `on_configure` 方法。通常在此读取参数，并做好一切准备以便控制器可以启动。
5. 实现 `command_interface_configuration` 和 `state_interface_configuration`，在此定义所需的接口。接口配置有三种选项：`ALL`、`INDIVIDUAL` 和 `NONE`，定义在 `controller_interface/controller_interface.hpp` 中。`ALL` 和 `NONE` 选项分别请求访问所有可用接口或完全不访问。`INDIVIDUAL` 配置需要所需接口名称的详细列表，这些通常作为参数提供。完整的接口名称结构为 `<joint_name>/<interface_type>`。
6. 实现 `on_activate` 方法，包括检查（并可能排序）接口以及为成员分配初始值。此方法是实时循环的一部分，因此要避免任何内存预留，并且总体上尽可能保持简短。
7. 实现 `on_deactivate` 方法，它与 `on_activate` 相反。在许多情况下，此方法是空的。此方法也应尽可能具备实时安全性。
8. 实现 `update` 方法作为主要入口点。该方法应考虑到实时约束来实现。当调用此方法时，状态接口具有来自硬件的最新值，并且应将硬件的新命令写入命令接口。
9. 重要：在文件末尾、命名空间关闭之后，添加 `PLUGINLIB_EXPORT_CLASS` 宏。为此你需要包含 `"pluginlib/class_list_macros.hpp"` 头文件。第一个参数应提供确切的控制器类，例如 `<controller_name_namespace>::<ControllerName>`；第二个参数是基类，即 `controller_interface::ControllerInterface`。

**5. 为 pluginlib 编写导出定义**

1. 在包中创建 `<controller_name>.xml` 文件，添加对 pluginlib 可见的库和控制器类的定义。最简单的方式是参考 ros2_controllers 包中的其他控制器。
2. 通常，插件名称由包（命名空间）和类名定义，例如 `<controller_name_package>/<ControllerName>`。当控制器管理器搜索控制器时，该名称定义了控制器的类型。另外两个参数必须与 `<controller_name>.cpp` 文件底部宏中的定义一致。

**6. 编写简单测试，检查控制器能否被找到并加载**

1. 在包中创建 `test` 文件夹（如果尚不存在），并添加一个名为 `test_load_<controller_name>.cpp` 的文件。
2. 你可以安全地复制 ros2_controllers 包中定义的任何控制器的文件内容。
3. 修改所复制测试的名称，并在最后一行指定控制器类型处，填入 `<controller_name>.xml` 文件中定义的名称，例如 `<controller_name_package>/<ControllerName>`。

**7. 在 `CMakeLists.txt` 文件中添加编译指令**

1. 在 `find_package(ament_cmake REQUIRED)` 一行下面添加更多依赖。至少包括：`controller_interface`、`hardware_interface`、`pluginlib`、`rclcpp` 和 `rclcpp_lifecycle`。
2. 添加一个以 `<controller_name>.cpp` 文件为源码的共享库编译指令。
3. 为该库添加目标的 include 目录。通常只需要 `include`。
4. 添加该库所需的 ament 依赖。至少应添加上述第 1 条列出的依赖。
5. 使用以下命令导出 pluginlib 描述文件：

```cmake
pluginlib_export_plugin_description_file(controller_interface <controller_name>.xml)
```

6. 为目标和 include 目录添加 install 指令。
7. 在测试部分添加以下依赖：`ament_cmake_gmock`、`controller_manager`、`hardware_interface`、`ros2_control_test_assets`。
8. 使用 `ament_add_gmock` 指令为测试添加编译定义。具体做法可参考 ros2_controllers 包中控制器的实现。
9. （可选）在 `ament_package()` 之前，将控制器库添加到 `ament_export_libraries`。

**8. 在 `package.xml` 文件中添加依赖**

1. 在 `<depend>` 标签中至少添加以下包：`controller_interface`、`hardware_interface`、`pluginlib`、`rclcpp` 和 `rclcpp_lifecycle`。
2. 在 `<test_depend>` 标签中至少添加以下包：`ament_add_gmock`、`controller_manager`、`hardware_interface` 和 `ros2_control_test_assets`。

**9. 编译并测试控制器**

1. 现在一切就绪，可以使用 `colcon build --packages-select <controller_name_package>` 命令编译控制器。请记得在执行命令前进入工作空间的根目录。
2. 如果编译成功，source install 文件夹中的 `setup.bash` 文件，然后执行 `colcon test --packages-select <controller_name_package>`，检查新控制器能否通过 `pluginlib` 库找到并被控制器管理器加载。

就是这样！祝你编写出优秀的控制器！

### 有用的外部参考

- 生成控制器外壳的模板和脚本

> **注意**
>
> 该脚本目前仅推荐用于 Humble，与 Jazzy 及之后版本的 API 不兼容。

# 3. 轮式移动机器人控制器（Controllers for Wheeled Mobile Robots）

## 3.1 差速驱动控制器（Differential Drive Controller）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/diff_drive_controller/doc/userdoc.html>

用于差速驱动移动机器人的控制器。

作为输入，它接收机器人机体的速度命令，并将其转换为差速驱动底盘的轮速命令。

里程计由硬件反馈计算并发布。

关于移动机器人运动学以及此处所用术语的介绍，参见 [轮式移动机器人运动学](#21-轮式移动机器人运动学wheeled-mobile-robot-kinematics)。

### 其他特性

- 实时安全（Realtime-safe）实现。
- 里程计发布。
- 任务空间（task-space）速度、加速度和加加速度（jerk）限制。
- 命令超时后自动停止。
- 可链式控制器（Chainable Controller）。

### 3.1.1 控制器接口说明

#### 参考接口（References）

当控制器处于链式（chained）模式时，它暴露以下可被前置控制器命令的参考接口：

- `<controller_name>/linear/velocity` double，单位 m/s
- `<controller_name>/angular/velocity` double，单位 rad/s

两者共同表示机体速度旋量（在非链式模式下，该旋量来自 ~/cmd_vel）。`<controller_name>` 通常设为 `diff_drive_controller`。

#### 反馈（Feedback）

反馈接口类型使用关节的位置（`hardware_interface::HW_IF_POSITION`）或速度（`hardware_interface::HW_IF_VELOCITY`，当参数 `position_feedback=false` 时）。除非设置参数 `open_loop=true`，此时不使用外部状态接口（改用被命令的速度来计算里程计）。

#### 输出（Output）

使用关节的速度（`hardware_interface::HW_IF_VELOCITY`）。

### 3.1.2 ROS 2 接口

#### 订阅者

**~/cmd_vel** `[geometry_msgs/msg/TwistStamped]`

控制器的速度命令。控制器提取线速度的 x 分量和角速度的 z 分量，其他分量的速度被忽略。

#### 发布者

**~/odom** `[nav_msgs::msg::Odometry]`

表示对机器人在自由空间中位置和速度的估计。

**/tf** `[tf2_msgs::msg::TFMessage]`

tf 树。仅当 `enable_odom_tf=true` 时发布。

**~/cmd_vel_out** `[geometry_msgs/msg/TwistStamped]`

已应用限幅后的控制器速度命令。仅当 `publish_limited_velocity=true` 时发布。

### 3.1.3 参数

该控制器使用 generate_parameter_library 来处理其参数。位于 src 文件夹中的参数定义文件包含控制器使用的所有参数的说明。

**`left_wheel_names`** (string_array)

左侧车轮关节的名称。

- 默认值：`{}`
- 约束：参数非空

**`right_wheel_names`** (string_array)

右侧车轮关节的名称。

- 默认值：`{}`
- 约束：参数非空

**`wheel_separation`** (double)

左右轮之间的最短距离。如果此参数错误，机器人在转弯时行为将不正确。

- 默认值：0.0
- 约束：大于 0.0

**`wheel_radius`** (double)

轮子的半径，即轮子尺寸，用于将线速度转换为轮子旋转。如果此参数错误，机器人将比预期移动得更快或更慢。

- 默认值：0.0
- 约束：大于 0.0

**`wheel_separation_multiplier`** (double)

当实际轮距与 `wheel_separation` 参数中的标称值不同时的修正系数。

- 默认值：1.0

**`left_wheel_radius_multiplier`** (double)

当左轮半径与 `wheel_radius` 参数中的标称值不同时的修正系数。

- 默认值：1.0

**`right_wheel_radius_multiplier`** (double)

当右轮半径与 `wheel_radius` 参数中的标称值不同时的修正系数。

- 默认值：1.0

**`tf_frame_prefix_enable`** (bool)

启用或禁用将 tf_prefix 附加到 tf 帧 ID 上。

- 默认值：true

**`tf_frame_prefix`** (string)

（可选）附加到 tf 帧的前缀，发布前会添加到 odom_id 和 base_frame_id 之前。如果参数为空，将使用控制器的命名空间。

- 默认值：""

**`odom_frame_id`** (string)

里程计帧的名称。当控制器发布里程计时，该帧是 `base_frame_id` 的父帧。

- 默认值："odom"

**`base_frame_id`** (string)

机器人基座帧的名称，它是里程计帧的子帧。

- 默认值："base_link"

**`pose_covariance_diagonal`** (double_array)

机器人位姿编码器输出的里程计协方差。这些值应根据你机器人的采样里程计数据进行调优，但这些值是很好的起点：`[0.001, 0.001, 0.001, 0.001, 0.001, 0.01]`。

- 默认值：{0.0, 0.0, 0.0, 0.0, 0.0, 0.0}

**`twist_covariance_diagonal`** (double_array)

机器人速度编码器输出的里程计协方差。这些值应根据你机器人的采样里程计数据进行调优，但这些值是很好的起点：`[0.001, 0.001, 0.001, 0.001, 0.001, 0.01]`。

- 默认值：{0.0, 0.0, 0.0, 0.0, 0.0, 0.0}

**`open_loop`** (bool)

若设为 true，机器人的里程计将从命令值计算，而非从反馈计算。

- 默认值：false

**`position_feedback`** (bool)

硬件是否有位置反馈。

- 默认值：true

**`enable_odom_tf`** (bool)

发布 `odom_frame_id` 与 `base_frame_id` 之间的变换。

- 默认值：true

**`cmd_vel_timeout`** (double)

超时时间（秒），超过该时间后，`cmd_vel` 话题上收到的命令被视为过期。值 0.0 禁用超时。

- 默认值：0.5

**`publish_limited_velocity`** (bool)

发布限幅后的速度值。

- 默认值：false

**`velocity_rolling_window_size`** (int)

用于计算里程计平均速度的滚动窗口大小。

- 默认值：10

**`publish_rate`** (double)

里程计和 TF 消息的发布频率（Hz）。

- 默认值：50.0

**`linear.x`**

线性 `x` 轴的关节限位结构。

- `linear.x.has_velocity_limits` (bool)：已弃用，可通过将相应限位设为 `.NAN` 来停用。默认：true
- `linear.x.has_acceleration_limits` (bool)：已弃用，可通过将相应限位设为 `.NAN` 来停用。默认：true
- `linear.x.has_jerk_limits` (bool)：已弃用，可通过将相应限位设为 `.NAN` 来停用。默认：true
- `linear.x.max_velocity` (double)：默认 `std::numeric_limits<double>::quiet_NaN()`；自定义校验：`control_filters::gt_eq_or_nan: 0.0`
- `linear.x.min_velocity` (double)：默认 `std::numeric_limits<double>::quiet_NaN()`；自定义校验：`control_filters::lt_eq_or_nan: 0.0`
- `linear.x.max_acceleration` (double)：前进方向的最大加速度。默认 `NaN`；自定义校验：`control_filters::gt_eq_or_nan: 0.0`
- `linear.x.max_deceleration` (double)：前进方向的最大减速度。默认 `NaN`；自定义校验：`control_filters::lt_eq_or_nan: 0.0`
- `linear.x.min_acceleration` (double)：已弃用，改用 max_deceleration。默认 `NaN`
- `linear.x.max_acceleration_reverse` (double)：后退方向的最大加速度。若未设置，使用 -max_acceleration。默认 `NaN`；自定义校验：`control_filters::lt_eq_or_nan: 0.0`
- `linear.x.max_deceleration_reverse` (double)：后退方向的最大减速度。若未设置，使用 -max_deceleration。默认 `NaN`；自定义校验：`control_filters::gt_eq_or_nan: 0.0`
- `linear.x.max_jerk` (double)：默认 `NaN`；自定义校验：`control_filters::gt_eq_or_nan: 0.0`
- `linear.x.min_jerk` (double)：默认 `NaN`；自定义校验：`control_filters::lt_eq_or_nan: 0.0`

**`angular.z`**

绕 `z` 轴旋转的关节限位结构。

- `angular.z.has_velocity_limits` (bool)：已弃用。默认：true
- `angular.z.has_acceleration_limits` (bool)：已弃用。默认：true
- `angular.z.has_jerk_limits` (bool)：已弃用。默认：true
- `angular.z.max_velocity` (double)：默认 `NaN`；自定义校验：`control_filters::gt_eq_or_nan: 0.0`
- `angular.z.min_velocity` (double)：默认 `NaN`；自定义校验：`control_filters::lt_eq_or_nan: 0.0`
- `angular.z.max_acceleration` (double)：正方向的最大加速度。默认 `NaN`；自定义校验：`control_filters::gt_eq_or_nan: 0.0`
- `angular.z.max_deceleration` (double)：正方向的最大减速度。默认 `NaN`；自定义校验：`control_filters::lt_eq_or_nan: 0.0`
- `angular.z.min_acceleration` (double)：已弃用，改用 max_deceleration。默认 `NaN`
- `angular.z.max_acceleration_reverse` (double)：负方向的最大加速度。若未设置，使用 -max_acceleration。默认 `NaN`；自定义校验：`control_filters::lt_eq_or_nan: 0.0`
- `angular.z.max_deceleration_reverse` (double)：负方向的最大减速度。若未设置，使用 -max_deceleration。默认 `NaN`；自定义校验：`control_filters::gt_eq_or_nan: 0.0`
- `angular.z.max_jerk` (double)：默认 `NaN`；自定义校验：`control_filters::gt_eq_or_nan: 0.0`
- `angular.z.min_jerk` (double)：默认 `NaN`；自定义校验：`control_filters::lt_eq_or_nan: 0.0`

该控制器的示例参数文件可在 test 目录中找到：

```yaml
test_diff_drive_controller:
  ros__parameters:
    left_wheel_names: ["left_wheels"]
    right_wheel_names: ["right_wheels"]

    wheel_separation: 0.40
    wheel_radius: 0.02

    wheel_separation_multiplier: 1.0
    left_wheel_radius_multiplier: 1.0
    right_wheel_radius_multiplier: 1.0

    odom_frame_id: odom
    base_frame_id: base_link
    pose_covariance_diagonal: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
    twist_covariance_diagonal: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0]

    position_feedback: false
    open_loop: true
    enable_odom_tf: true

    cmd_vel_timeout: 0.5 # seconds
    publish_limited_velocity: true
    velocity_rolling_window_size: 10

    linear.x.max_velocity: .NAN
    linear.x.min_velocity: .NAN
    linear.x.max_acceleration: .NAN
    linear.x.max_deceleration: .NAN
    linear.x.max_acceleration_reverse: .NAN
    linear.x.max_deceleration_reverse: .NAN
    linear.x.max_jerk: .NAN
    linear.x.min_jerk: .NAN

    angular.z.max_velocity: .NAN
    angular.z.min_velocity: .NAN
    angular.z.max_acceleration: .NAN
    angular.z.max_deceleration: .NAN
    angular.z.max_acceleration_reverse: .NAN
    angular.z.max_deceleration_reverse: .NAN
    angular.z.max_jerk: .NAN
    angular.z.min_jerk: .NAN
```


## 3.2 麦克纳姆轮驱动控制器（Mecanum Drive Controllers）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/mecanum_drive_controller/doc/userdoc.html>

用于麦克纳姆轮驱动（四个麦克纳姆轮）移动机器人控制器的共享功能库。该库实现通用的里程计和更新方法，并定义主要接口。

### 3.2.1 控制器的执行逻辑

控制器使用速度输入，即带时间戳的 Twist 消息，其中使用线速度 `x`、`y` 和角速度 `z` 分量。其他分量的值被忽略。在链式（chain）模式下，控制器提供三个参考接口：一个用于线速度，一个用于转向角位置。其他相关特性：

- 以 Odometry 和 TF 消息形式发布里程计；
- 基于参数的输入命令超时。

关于里程计计算的说明：在 DiffDriveController 中，速度会被滤波，但我们更倾向于返回原始值，让用户自行进行后处理。我们倾向于这样做，因为滤波会引入延迟（这使得行为曲线的解读和比较变得困难）。

### 3.2.2 控制器接口说明

#### 参考接口（来自前置控制器）

当控制器处于链式模式时，它暴露以下可被前置控制器命令的参考接口：

- `<controller_name>/linear/x/velocity`，单位 m/s
- `<controller_name>/linear/y/velocity`，单位 m/s
- `<controller_name>/angular/z/velocity`，单位 rad/s

#### 命令接口（Commands）

- `<*_wheel_command_joint_name>/velocity`，单位 rad/s

#### 状态接口（States）

- `<joint_name>/velocity`，单位 rad/s

> **注意**
>
> `joint_name` 可以是 `*_wheel_state_joint_name` 参数指定的关节名（如果使用），否则为 `*_wheel_command_joint_name`。

#### 订阅者

当控制器不处于链式模式（`in_chained_mode == false`）时使用。

- `<controller_name>/reference` `[geometry_msgs/msg/TwistStamped]`

#### 发布者

- `<controller_name>/odometry` `[nav_msgs/msg/Odometry]`
- `<controller_name>/tf_odometry` `[tf2_msgs/msg/TFMessage]`
- `<controller_name>/controller_state` `[control_msgs/msg/MecanumDriveControllerState]`

### 3.2.3 参数

该控制器使用 generate_parameter_library 来处理其参数。位于 src 文件夹中的参数定义文件包含控制器使用的所有参数的说明。

**`reference_timeout`** (double)

控制器参考值的超时时间，超过后将被重置。这对于参考值未重置可能导致不希望且危险行为的控制器（例如速度控制器）尤其有用。若值为 0，则每次运行后参考值都会被重置。

- 默认值：0.0

**`front_left_wheel_command_joint_name`** (string)

用于命令左前轮的关节名称。

- 只读：True
- 默认值：""
- 约束：参数非空

**`front_right_wheel_command_joint_name`** (string)

用于命令右前轮的关节名称。

- 只读：True
- 默认值：""
- 约束：参数非空

**`rear_right_wheel_command_joint_name`** (string)

用于命令右后轮的关节名称。

- 只读：True
- 默认值：""
- 约束：参数非空

**`rear_left_wheel_command_joint_name`** (string)

用于命令左后轮的关节名称。

- 只读：True
- 默认值：""
- 约束：参数非空

**`front_left_wheel_state_joint_name`** (string)

（可选）指定用于读取左前轮状态的关节名称。仅当状态关节与命令关节不同时（即使用后置控制器时）相关。

- 只读：True
- 默认值：""

**`front_right_wheel_state_joint_name`** (string)

（可选）指定用于读取右前轮状态的关节名称。仅当状态关节与命令关节不同时（即使用后置控制器时）相关。

- 只读：True
- 默认值：""

**`rear_right_wheel_state_joint_name`** (string)

（可选）指定用于读取右后轮状态的关节名称。仅当状态关节与命令关节不同时（即使用后置控制器时）相关。

- 只读：True
- 默认值：""

**`rear_left_wheel_state_joint_name`** (string)

（可选）指定用于读取左后轮状态的关节名称。仅当状态关节与命令关节不同时（即使用后置控制器时）相关。

- 只读：True
- 默认值：""

**`kinematics.base_frame_offset.x`** (double)

base_frame（base_link 帧）沿 X 轴的偏移量。

- 只读：True
- 默认值：0.0

**`kinematics.base_frame_offset.y`** (double)

base_frame（base_link 帧）沿 Y 轴的偏移量。

- 只读：True
- 默认值：0.0

**`kinematics.base_frame_offset.theta`** (double)

base_frame（base_link 帧）沿 Theta 轴的偏移量。

- 只读：True
- 默认值：0.0

**`kinematics.wheels_radius`** (double)

轮子半径。

- 只读：True
- 默认值：0.0
- 约束：大于 0.0

**`kinematics.sum_of_robot_center_projection_on_X_Y_axis`** (double)

麦克纳姆轮逆运动学（IK）中使用的轮子几何参数。lx 和 ly 分别表示机器人中心到轮子在 x 轴和 y 轴上的投影距离（原点在机器人中心），`sum_of_robot_center_projection_on_X_Y_axis = lx+ly`。

- 只读：True
- 默认值：0.0

**`tf_frame_prefix_enable`** (bool)

启用或禁用将 `tf_frame_prefix` 附加到 tf 帧 ID 上。更多信息见其参数说明。

- 默认值：true

**`tf_frame_prefix`** (string)

（可选）附加到 tf 帧的前缀，发布前会添加到 odom_frame_id 和 base_frame_id 之前。如果参数为空，将使用控制器的命名空间。

- 只读：True
- 默认值：""

**`base_frame_id`** (string)

base_frame_id 设置为该值。

- 只读：True
- 默认值："base_link"

**`odom_frame_id`** (string)

odom_frame_id 设置为该值。

- 只读：True
- 默认值："odom"

**`enable_odom_tf`** (bool)

是否启用向 tf 发布？

- 默认值：true

**`twist_covariance_diagonal`** (double_array)

速度协方差矩阵的对角值。

- 只读：True
- 默认值：{0.1, 0.1, 0.1, 0.1, 0.1, 0.1}

**`pose_covariance_diagonal`** (double_array)

位姿协方差矩阵的对角值。

- 只读：True
- 默认值：{0.1, 0.1, 0.1, 0.1, 0.1, 0.1}

**限位参数（线性 `linear.x` / `linear.y`、角向 `angular.z`）**

与 diff_drive_controller 相同的任务空间限位结构（`max_velocity`、`min_velocity`、`max_acceleration`、`max_deceleration`、`max_acceleration_reverse`、`max_deceleration_reverse`、`max_jerk`、`min_jerk`），默认值均为 `std::numeric_limits<double>::quiet_NaN()`，并带有相应的 `control_filters` 自定义校验（正方向 `gt_eq_or_nan: 0.0`，负方向 `lt_eq_or_nan: 0.0`）。说明：`linear.x.max_acceleration`/`max_deceleration` 描述前进方向；`linear.y` 同理；`angular.z` 描述正方向；`*_reverse` 变体描述后退/负方向，若未设置使用对应的负值。

该控制器的示例参数文件可在 test 目录中找到：

```yaml
/**:
  test_mecanum_drive_controller:
    ros__parameters:
      reference_timeout: 0.9

      front_left_wheel_command_joint_name: "front_left_wheel_joint"
      front_right_wheel_command_joint_name: "front_right_wheel_joint"
      rear_right_wheel_command_joint_name: "back_right_wheel_joint"
      rear_left_wheel_command_joint_name: "back_left_wheel_joint"

      kinematics:
        base_frame_offset: { x: 0.0, y: 0.0, theta: 0.0 }
        wheels_radius: 0.5
        sum_of_robot_center_projection_on_X_Y_axis: 1.0

      base_frame_id: "base_link"
      odom_frame_id: "odom"
      enable_odom_tf: true
      twist_covariance_diagonal: [0.0, 7.0, 14.0, 21.0, 28.0, 35.0]
      pose_covariance_diagonal: [0.0, 6.0, 12.0, 18.0, 24.0, 30.0]


  test_mecanum_drive_controller_with_rotation:
    ros__parameters:
      reference_timeout: 5.0

      front_left_wheel_command_joint_name: "front_left_wheel_joint"
      front_right_wheel_command_joint_name: "front_right_wheel_joint"
      rear_right_wheel_command_joint_name: "rear_right_wheel_joint"
      rear_left_wheel_command_joint_name: "rear_left_wheel_joint"

      kinematics:
        base_frame_offset: { x: 1.0, y: 2.0, theta: 3.0 }
        wheels_radius: 0.05
        sum_of_robot_center_projection_on_X_Y_axis: 0.2925

      base_frame_id: "base_link"
      odom_frame_id: "odom"
      enable_odom_tf: true
      pose_covariance_diagonal: [0.001, 0.001, 0.001, 0.001, 0.001, 0.001]
      twist_covariance_diagonal: [0.001, 0.001, 0.001, 0.001, 0.001, 0.001]

  test_mecanum_drive_controller_with_limits:
    ros__parameters:
      reference_timeout: 0.9

      front_left_wheel_command_joint_name: "front_left_wheel_joint"
      front_right_wheel_command_joint_name: "front_right_wheel_joint"
      rear_right_wheel_command_joint_name: "back_right_wheel_joint"
      rear_left_wheel_command_joint_name: "back_left_wheel_joint"

      kinematics:
        base_frame_offset: { x: 0.0, y: 0.0, theta: 0.0 }
        wheels_radius: 0.5
        sum_of_robot_center_projection_on_X_Y_axis: 1.0

      base_frame_id: "base_link"
      odom_frame_id: "odom"
      enable_odom_tf: true
      twist_covariance_diagonal: [0.0, 7.0, 14.0, 21.0, 28.0, 35.0]
      pose_covariance_diagonal: [0.0, 6.0, 12.0, 18.0, 24.0, 30.0]

      linear:
        x:
          max_acceleration: 2.0
          max_deceleration: -4.0
          max_acceleration_reverse: -8.0
          max_deceleration_reverse: 10.0
        y:
          max_acceleration: 2.0
          max_deceleration: -4.0
          max_acceleration_reverse: -8.0
          max_deceleration_reverse: 10.0
      angular:
        z:
          max_acceleration: 2.0
          max_deceleration: -4.0
          max_acceleration_reverse: -8.0
          max_deceleration_reverse: 10.0
```


## 3.3 全向轮驱动控制器（Omni Wheel Drive Controller）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/omni_wheel_drive_controller/doc/userdoc.html>

用于具有全向驱动（omnidirectional drive）的移动机器人的控制器。

支持使用三个或更多以相同角度间隔均匀分布在圆周上的全向轮。为了更好地理解这一点，请查看《轮式移动机器人运动学》（Wheeled Mobile Robot Kinematics）。

该控制器使用速度输入，即带时间戳的 Twist 消息，其中使用线速度 `x`、`y` 和角速度 `z` 分量。其他分量的值被忽略。

里程计由硬件反馈计算得出并发布。

### 3.3.1 其他特性

- 实时安全实现（Realtime-safe implementation）；
- 里程计发布；
- 命令超时后自动停止。

### 3.3.2 控制器接口说明

#### 参考接口（来自前置控制器）

当控制器处于链式模式时，它暴露以下可被前置控制器命令的参考接口：

- `<controller_name>/linear/x/velocity`，double，单位 m/s
- `<controller_name>/linear/y/velocity`，double，单位 m/s
- `<controller_name>/angular/z/velocity`，double，单位 rad/s

它们共同代表机身角速度（body twist）（在非链式模式下，这可以通过 `~/cmd_vel` 获得）。

#### 状态接口

作为反馈接口类型，使用关节的位置（`hardware_interface::HW_IF_POSITION`）或速度（`hardware_interface::HW_IF_VELOCITY`，当参数 `position_feedback=false` 时）。

#### 命令接口

使用关节的速度（`hardware_interface::HW_IF_VELOCITY`）。

### 3.3.3 ROS 2 接口

#### 订阅者

**`~/cmd_vel`** `[geometry_msgs/msg/TwistStamped]`

控制器的速度命令。控制器提取线速度的 x 和 y 分量以及角速度的 z 分量。其他分量上的速度被忽略。

#### 发布者

**`~/odom`** `[nav_msgs::msg::Odometry]`

表示机器人自由空间位置和速度的估计。

**`/tf`** `[tf2_msgs::msg::TFMessage]`

tf 树。仅当 `enable_odom_tf=true` 时发布。

#### 参数

该控制器使用 generate_parameter_library 来处理其参数。位于 src 文件夹中的参数定义文件包含控制器使用的所有参数的说明。

**`wheel_offset`** (double)

第一个轮子与机器人 x 轴正方向的夹角（弧度）。

- 只读：True

**`wheel_names`** (string_array)

轮子关节的名称，按逆时针顺序给出，从与机器人 x 轴正方向对齐（或偏离 `wheel_offset` 指定值）的轮子开始。

- 只读：True
- 约束：参数非空

**`robot_radius`** (double)

机器人的半径，即机器人中心到轮子的距离。如果该参数错误，机器人在转弯时将不能正确运行。

- 只读：True
- 约束：大于 0.0

**`wheel_radius`** (double)

单个轮子的半径，即轮子尺寸，用于将线速度转换为轮子旋转速度。如果该参数错误，机器人将比预期移动得更快或更慢。

- 只读：True
- 约束：大于 0.0

**`tf_frame_prefix_enable`** (bool)

启用或禁用将 tf_prefix 附加到 tf 帧 ID 上。

- 只读：True
- 默认值：true

**`tf_frame_prefix`** (string)

（可选）附加到 tf 帧的前缀，发布前会添加到 odom_id 和 base_frame_id 之前。如果参数为空，将使用控制器的命名空间。

- 只读：True
- 默认值：""

**`odom_frame_id`** (string)

里程计的帧名称。当控制器发布里程计时，该帧是 `base_frame_id` 的父帧。

- 只读：True
- 默认值："odom"

**`base_frame_id`** (string)

机器人基座帧的名称，是里程计帧的子帧。

- 只读：True
- 默认值："base_link"

**`diagonal_covariance.pose`** (double_array)

机器人编码器输出对应位姿的里程计协方差。这些值应根据您机器人的样本里程计数据进行调整，但以下数值是一个不错的起点：`[0.001, 0.001, 0.001, 0.001, 0.001, 0.01]`。

- 只读：True
- 默认值：{0.0, 0.0, 0.0, 0.0, 0.0, 0.0}

**`diagonal_covariance.twist`** (double_array)

机器人编码器输出对应速度的里程计协方差。这些值应根据您机器人的样本里程计数据进行调整，但以下数值是一个不错的起点：`[0.001, 0.001, 0.001, 0.001, 0.001, 0.01]`。

- 只读：True
- 默认值：{0.0, 0.0, 0.0, 0.0, 0.0, 0.0}

**`open_loop`** (bool)

如果设为 true，则机器人的里程计将根据命令值而非反馈来计算。

- 只读：True
- 默认值：false

**`position_feedback`** (bool)

仅当 `open_loop` 设为 false 时有效。如果硬件有位置反馈，则将该参数设为 `true`，否则设为 `false`。

- 只读：True
- 默认值：true

**`enable_odom_tf`** (bool)

发布 `odom_frame_id` 与 `base_frame_id` 之间的变换。

- 只读：True
- 默认值：true

**`cmd_vel_timeout`** (double)

超时时间（秒），超过后 `~/cmd_vel` 话题上的输入命令被认为过期。

- 只读：True
- 默认值：0.5

该控制器的一个示例参数文件可在 test 目录中找到：

```yaml
test_omni_wheel_drive_controller:
  ros__parameters:
    wheel_offset: 0.0
    wheel_names:
      [
        "front_wheel_joint",
        "left_wheel_joint",
        "back_wheel_joint",
        "right_wheel_joint",
      ]

    robot_radius: 0.20
    wheel_radius: 0.02

    odom_frame_id: odom
    base_frame_id: base_link
    pose_covariance_diagonal: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
    twist_covariance_diagonal: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0]

    open_loop: true
    position_feedback: false
    enable_odom_tf: true

    cmd_vel_timeout: 0.5
    publish_limited_velocity: true
```


## 3.4 转向控制器库（Steering Controllers Library）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/steering_controllers_library/doc/userdoc.html>

用于具有转向驱动（2 个自由度，即所谓非完整约束 non-holonomic constraints）的移动机器人控制器的共享功能库。

该库实现通用的里程计和更新方法，并定义主要接口。

更新方法只使用逆运动学，不实现任何反馈控制回路，如路径跟踪控制器等。

关于移动机器人运动学的介绍以及此处使用的术语，请参阅《轮式移动机器人运动学》（Wheeled Mobile Robot Kinematics）。

### 3.4.1 控制器的执行逻辑

控制器使用速度输入，即带时间戳的 Twist 消息，其中使用线速度 `x` 和角速度 `z` 分量。其他分量的值被忽略。

在链式模式下，控制器提供两个参考接口：一个用于线速度，一个用于转向角位置。其他相关特性：

- 支持前轮转向和后轮转向配置；
- 以 Odometry 和 TF 消息形式发布里程计；
- 基于参数的输入命令超时。

轮子的命令使用 `odometry` 库计算，根据具体的运动学模型计算牵引和转向命令。

### 3.4.2 当前已实现的运动学模型

- Bicycle（自行车）—— 一个转向关节和一个驱动关节；
- Tricycle（三轮车）—— 一个转向关节和两个驱动关节；
- Ackermann（阿克曼）—— 两个转向关节和两个驱动关节。

### 3.4.3 控制器接口说明

#### 参考接口（来自前置控制器）

当控制器处于链式模式（`in_chained_mode == true`）时使用。

- `<controller_name>/linear/velocity`，double，单位 m/s
- `<controller_name>/angular/velocity`，double，单位 rad/s

代表机身角速度（body twist）。

#### 命令接口

- `<steering_joints_names[i]>/position`，double，单位 rad
- `<traction_joints_names[i]>/velocity`，double，单位 rad/s

#### 状态接口

根据 `position_feedback` 的不同，期望的反馈类型不同：

- `position_feedback == true` → `TRACTION_FEEDBACK_TYPE = position`
- `position_feedback == false` → `TRACTION_FEEDBACK_TYPE = velocity`

对应以下状态接口：

- `<steering_joints_names[i]>/position`，double，单位 rad
- `<traction_joints_names[i]>/<TRACTION_FEEDBACK_TYPE>`，double，单位 rad 或 rad/s

#### 订阅者

当控制器不处于链式模式（`in_chained_mode == false`）时使用。

- `<controller_name>/reference` `[geometry_msgs/msg/TwistStamped]`

#### 发布者

- `<controller_name>/odometry` `[nav_msgs/msg/Odometry]`
- `<controller_name>/tf_odometry` `[tf2_msgs/msg/TFMessage]`
- `<controller_name>/controller_state` `[control_msgs/msg/SteeringControllerStatus]`

#### 参数

该控制器使用 generate_parameter_library 来处理其参数。

参数化的示例可参考控制器包的 `test` 文件夹。

**`reference_timeout`** (double)

控制器参考值的超时时间，超过后将被重置。这对于参考值未重置可能导致不希望且危险行为的控制器（例如速度控制器）尤其有用。若值为 0，则每次运行后参考值都会被重置。

- 默认值：1.0

**`front_steering`** (bool)

已弃用（DEPRECATED）：改用 `traction_joints_names` 或 `steering_joints_names`。

- 只读：True
- 默认值：true

**`rear_wheels_names`** (string_array)

已弃用（DEPRECATED）：改用 `traction_joints_names` 或 `steering_joints_names`。

- 只读：True
- 默认值：{}
- 约束：长度小于 5；不包含重复项

**`traction_joints_names`** (string_array)

牵引轮关节的名称。对于具有两个牵引关节的运动学配置，期望的顺序为：右关节、左关节。

- 只读：True
- 默认值：{}
- 约束：长度小于 5；不包含重复项

**`front_wheels_names`** (string_array)

已弃用（DEPRECATED）：改用 `traction_joints_names` 或 `steering_joints_names`。

- 只读：True
- 默认值：{}
- 约束：长度小于 5；不包含重复项

**`steering_joints_names`** (string_array)

转向关节的名称。对于具有两个转向关节的运动学配置，期望的顺序为：右关节、左关节。转向轴的方向期望如下：当命令正值转向位置时，机器人应绕车辆 z 轴正方向转向（参见 REP-103）。

- 只读：True
- 默认值：{}
- 约束：长度小于 5；不包含重复项

**`traction_joints_state_names`** (string_array)

（可选）用于读取状态的牵引关节名称。如果未设置，将使用 `traction_joints_names` 中的关节名称。

- 只读：True
- 默认值：{}
- 约束：长度小于 5；不包含重复项

**`rear_wheels_state_names`** (string_array)

已弃用（DEPRECATED）：改用 `traction_joints_state_names` 或 `steering_joints_state_names`。

- 只读：True
- 默认值：{}
- 约束：长度小于 5；不包含重复项

**`steering_joints_state_names`** (string_array)

（可选）用于读取状态的转向关节名称。如果未设置，将使用 `steering_joints_names` 中的关节名称。

- 只读：True
- 默认值：{}
- 约束：长度小于 5；不包含重复项

**`front_wheels_state_names`** (string_array)

已弃用（DEPRECATED）：改用 `traction_joints_state_names` 或 `steering_joints_state_names`。

- 只读：True
- 默认值：{}
- 约束：长度小于 5；不包含重复项

**`open_loop`** (bool)

选择里程计计算是使用开环（open-loop）还是反馈（feedback）。

- 默认值：false

**`reduce_wheel_speed_until_steering_reached`** (bool)

在达到转向角度之前降低轮速。

- 默认值：false

**`velocity_rolling_window_size`** (int)

用于计算里程计 twist.linear.x 和 twist.angular.z 速度时取平均的速度样本数量。

- 默认值：10

**`base_frame_id`** (string)

base_frame_id 设置为该值。

- 默认值："base_link"

**`odom_frame_id`** (string)

odom_frame_id 设置为该值。

- 默认值："odom"

**`enable_odom_tf`** (bool)

是否启用向 tf 发布？

- 默认值：true

**`twist_covariance_diagonal`** (double_array)

速度协方差矩阵的对角值。

- 默认值：{0.0, 7.0, 14.0, 21.0, 28.0, 35.0}

**`pose_covariance_diagonal`** (double_array)

位姿协方差矩阵的对角值。

- 默认值：{0.0, 7.0, 14.0, 21.0, 28.0, 35.0}

**`position_feedback`** (bool)

反馈类型的选择，如果 position_feedback 为 false，则使用 `HW_IF_VELOCITY` 作为接口类型；如果 position_feedback 为 true，则使用 `HW_IF_POSITION` 作为接口类型。

- 默认值：false

### 3.4.4 自行车转向控制器（Bicycle Steering Controller）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/bicycle_steering_controller/doc/userdoc.html>

该控制器实现了具有两个轴和两个轮子的运动学模型，其中一个轴上的轮子是固定（牵引/驱动）轮，另一个轴上的轮子是可转向轮。

控制器期望有一个用于牵引的命令关节和一个用于转向的命令关节。如果您的阿克曼转向车辆在轴上使用差速器（differentials），那么您可能应该使用这个控制器，因为您只能命令一个位于轴中间的虚拟轮的牵引速度和转向角。

关于控制器执行逻辑和接口的更多细节，请参阅《转向控制器库》（Steering Controller Library）。

**参数**

该控制器使用 generate_parameter_library 来处理其参数。

参数化的示例可参考控制器包的 `test` 文件夹。

除了《转向控制器库》的参数外，该控制器还增加了以下参数：

**`wheelbase`** (double)

前后轮之间的距离。详细信息见：<https://en.wikipedia.org/wiki/Wheelbase>

- 默认值：0.0
- 约束：大于 0.0

**`traction_wheel_radius`** (double)

牵引轮半径。

- 默认值：0.0

**`front_wheel_radius`** (double)

已弃用（DEPRECATED）：使用 `traction_wheel_radius`。

- 只读：True
- 默认值：0.0

**`rear_wheel_radius`** (double)

已弃用（DEPRECATED）：使用 `traction_wheel_radius`。

- 只读：True
- 默认值：0.0

### 3.4.5 三轮转向控制器（Tricycle Steering Controller）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/tricycle_steering_controller/doc/userdoc.html>

该控制器实现了具有两个轴和三个轮子的运动学模型，其中一个轴上的两个轮子是固定（牵引/驱动）轮，另一个轴上的轮子是可转向轮。

控制器期望有两个用于牵引的命令关节（每个固定轮一个）和一个用于转向的命令关节。

关于控制器执行逻辑和接口的更多细节，请参阅《转向控制器库》（Steering Controller Library）。

**参数**

该控制器使用 generate_parameter_library 来处理其参数。

参数化的示例可参考控制器包的 `test` 文件夹。

除了《转向控制器库》的参数外，该控制器还增加了以下参数：

**`wheel_track`** (double)

（已弃用 deprecated）轴距（Axle track），使用 `traction_track_width` 代替。

- 默认值：0.0

**`traction_track_width`** (double)

轴距（Axle track）。

- 默认值：0.0

**`wheelbase`** (double)

前后轮之间的距离。详细信息见：<https://en.wikipedia.org/wiki/Wheelbase>

- 默认值：0.0
- 约束：大于 0.0

**`traction_wheels_radius`** (double)

牵引轮半径。

- 默认值：0.0

**`front_wheels_radius`** (double)

已弃用（DEPRECATED）：使用 `traction_wheels_radius`。

- 默认值：0.0

**`rear_wheels_radius`** (double)

已弃用（DEPRECATED）：使用 `traction_wheels_radius`。

- 默认值：0.0

### 3.4.6 阿克曼转向控制器（Ackermann Steering Controller）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/ackermann_steering_controller/doc/userdoc.html>

该控制器实现了具有两个轴和四个轮子的运动学模型，其中一个轴上的轮子是固定（牵引/驱动）轮，另一个轴上的轮子是可转向轮。

控制器期望有两个用于牵引的命令关节（每个固定轮一个）和两个用于转向的命令关节（每个轮一个）。

关于控制器执行逻辑和接口的更多细节，请参阅《转向控制器库》（Steering Controller Library）。

**参数**

该控制器使用 generate_parameter_library 来处理其参数。

参数化的示例可参考控制器包的 `test` 文件夹。

除了《转向控制器库》的参数外，该控制器还增加了以下参数：

**`front_wheel_track`** (double)

已弃用（DEPRECATED）：使用 `traction_track_width` 或 `steering_track_width`。

- 默认值：0.0

**`steering_track_width`** (double)

（可选）转向轮轮距（track）长度。如果未设置，将使用 `traction_track_width`。

- 默认值：0.0

**`rear_wheel_track`** (double)

已弃用（DEPRECATED）：使用 `traction_track_width` 或 `steering_track_width`。

- 默认值：0.0

**`traction_track_width`** (double)

牵引轮轮距长度。详细信息见：<https://en.wikipedia.org/wiki/Wheelbase>

- 默认值：0.0

**`wheelbase`** (double)

前后轮之间的距离。详细信息见：<https://en.wikipedia.org/wiki/Wheelbase>

- 默认值：0.0
- 约束：大于 0.0

**`traction_wheels_radius`** (double)

牵引轮半径。

- 默认值：0.0

**`front_wheels_radius`** (double)

已弃用（DEPRECATED）：使用 `traction_wheels_radius`。

- 默认值：0.0

**`rear_wheels_radius`** (double)

已弃用（DEPRECATED）：使用 `traction_wheels_radius`。

- 默认值：0.0

## 3.5 三轮车控制器（Tricycle Controller）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/tricycle_controller/doc/userdoc.html>

用于具有单个双驱动轮（包括牵引和转向）的移动机器人的控制器。例如，一辆前轮为驱动轮、后轴上有两个随动轮的三轮车机器人。

控制器的输入是机器人 base_link 的 Twist 命令，这些命令被转换为三轮车驱动底盘（tricycle drive base）的牵引和转向命令。里程计由硬件反馈计算得出并发布。

关于移动机器人运动学的介绍以及此处使用的术语，请参阅《轮式移动机器人运动学》（Wheeled Mobile Robot Kinematics）。

**其他特性**

- 实时安全实现；
- 里程计发布；
- 速度、加速度和加加速度限制；
- 命令超时后自动停止。

**ROS 2 接口**

**订阅者**

**`~/cmd_vel`** `[geometry_msgs/msg/TwistStamped]`

控制器的速度命令。控制器提取线速度的 x 分量和角速度的 z 分量。其他分量上的速度被忽略。

**参数**

该控制器使用 generate_parameter_library 来处理其参数。

**`traction_joint_name`** (string)

牵引关节的名称。

- 默认值：""
- 约束：参数非空

**`steering_joint_name`** (string)

转向关节的名称。

- 默认值：""
- 约束：参数非空

**`wheelbase`** (double)

前轮与后轴之间的最短距离。如果该参数错误，机器人在转弯时将不能正确运行。

- 默认值：0.0
- 约束：大于 0.0

**`wheel_radius`** (double)

单个轮子的半径，即轮子尺寸，用于将线速度转换为轮子旋转速度。如果该参数错误，机器人将比预期移动得更快或更慢。

- 默认值：0.0
- 约束：大于 0.0

**`odom_frame_id`** (string)

里程计的帧名称。当控制器发布里程计时，该帧是 `base_frame_id` 的父帧。

- 默认值："odom"

**`base_frame_id`** (string)

机器人基座帧的名称，是里程计帧的子帧。

- 默认值："base_link"

**`pose_covariance_diagonal`** (double_array)

机器人编码器输出对应位姿的里程计协方差。这些值应根据您机器人的样本里程计数据进行调整，但以下数值是一个不错的起点：`[0.001, 0.001, 0.001, 0.001, 0.001, 0.01]`。

- 默认值：{0.0, 0.0, 0.0, 0.0, 0.0, 0.0}

**`twist_covariance_diagonal`** (double_array)

机器人编码器输出对应速度的里程计协方差。这些值应根据您机器人的样本里程计数据进行调整，但以下数值是一个不错的起点：`[0.001, 0.001, 0.001, 0.001, 0.001, 0.01]`。

- 默认值：{0.0, 0.0, 0.0, 0.0, 0.0, 0.0}

**`open_loop`** (bool)

如果设为 true，则机器人的里程计将根据命令值而非反馈来计算。

- 默认值：false

**`enable_odom_tf`** (bool)

发布 `odom_frame_id` 与 `base_frame_id` 之间的变换。

- 默认值：false

**`odom_only_twist`** (bool)

用于在独立节点中进行位姿积分。

- 默认值：false

**`cmd_vel_timeout`** (int)

超时时间（毫秒），超过后 `cmd_vel` 话题上的输入命令被认为过期。

- 默认值：500

**`publish_ackermann_command`** (bool)

发布受限命令（limited commands）。

- 默认值：false

**`velocity_rolling_window_size`** (int)

用于计算里程计平均速度的滚动窗口大小。

- 默认值：10
- 约束：大于 0

**`traction.max_velocity` / `traction.min_velocity` / `traction.max_acceleration` / `traction.min_acceleration` / `traction.max_deceleration` / `traction.min_deceleration` / `traction.max_jerk` / `traction.min_jerk`** (double)

牵引关节的速度/加速度/减速度/加加速度限位。

- 默认值：`std::numeric_limits<double>::quiet_NaN()`

**`steering.max_position` / `steering.min_position` / `steering.max_velocity` / `steering.min_velocity` / `steering.max_acceleration` / `steering.min_acceleration`** (double)

转向关节的位置/速度/加速度限位。

- 默认值：`std::numeric_limits<double>::quiet_NaN()`


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


## 4.6 关节轨迹控制器（Joint Trajectory Controller）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/joint_trajectory_controller/doc/userdoc.html>

用于在一组关节上执行关节空间轨迹的控制器。控制器在时间上对点之间进行插值，因此点之间的距离可以是任意的。甚至只包含一个点的轨迹也被接受。轨迹被指定为一组在特定时间点要达到的航点（waypoints），控制器会尽机构所允许的能力尝试执行这些航点。航点由位置以及可选的（可选）速度和加速度组成。

_本文档的部分内容最初以 CC BY 3.0 许可发布在 ROS 1 wiki 上。各节中给出了引用，但已针对 ROS 2 实现进行了改编。_ [1]

### 4.6.1 硬件接口类型

目前，具有 `position`、`velocity`、`acceleration` 和 `effort` 硬件接口类型（在此定义）的关节，以下列组合作为命令接口受支持：

- `position`
- `position`, `velocity`
- `position`, `velocity`, `acceleration`
- `velocity`
- `effort`
- `position`, `effort`

这意味着关节可以有一个或多个命令接口，同时应用以下控制律：

- 对于 `position` 命令接口，期望位置被直接转发给关节；
- 对于 `acceleration` 命令接口，期望加速度被直接转发给关节；
- 对于 `velocity` 命令接口，如果配置了 PID 回路（参数详情），则位置+速度轨迹跟随误差通过 PID 回路映射为 `velocity` 命令；
- 对于 `effort` 命令接口（没有 `position` 命令接口），如果配置了 PID 回路（参数详情），则位置+速度轨迹跟随误差通过 PID 回路映射为 `effort` 命令。此外，它还会将轨迹的力作为前馈力（feedforward effort）加到 PID 输出上；
- 对于 `position, effort` 命令接口，不使用 PID 回路。如果轨迹包含力，其值将直接传递给 `effort` 接口，而期望位置将转发给 `position` 接口。这对于需要额外力来维持接触的操作任务（manipulation tasks）可能很有用。

这导致了以下命令接口与状态接口的允许组合：

- 对于 `position` 命令接口，状态接口没有限制；
- 对于 `velocity` 命令接口：
  - 如果 `velocity` 是唯一的命令接口，则状态接口必须包含 `position, velocity`；
- 对于 `effort` 或 `position, effort` 命令接口，状态接口必须包含 `position, velocity`；
- 对于 `acceleration` 命令接口，状态接口必须包含 `position, velocity`。

还存在进一步的状态接口限制：

- 如果缺少 `position` 接口，则不能使用 `velocity` 状态接口；
- 如果 `position` 和 `velocity` 接口不存在，则不能使用 `acceleration` 状态接口。

示例控制器配置可在下文找到。

### 4.6.2 其他特性

- 实时安全实现；
- 正确处理缠绕（连续）关节（wrapping/continuous joints）；
- 对系统时钟变化稳健：不连续的系统时钟变化不会导致已排队轨迹段的执行出现不连续；
- 取消时可选的平滑减速：控制器不是突然保持位置，而是可以使用可配置的逐关节减速度限制来让关节减速到停止。参见《取消时减速》（Decelerate on cancel）。

### 4.6.3 使用关节轨迹控制器

控制器期望至少来自硬件的 position 反馈。关节速度和加速度是可选的。目前控制器不会内部从加速度积分出速度、从速度积分出位置。因此，如果硬件只提供加速度或速度状态，则必须在 hardware-interface 实现的 velocity 和 position 中完成积分才能使用这些控制器。

本包中实现了关节轨迹控制器的通用版本。使用它的 yaml 文件可以是：

```yaml
controller_manager:
  ros__parameters:
    joint_trajectory_controller:
      type: "joint_trajectory_controller/JointTrajectoryController"

joint_trajectory_controller:
  ros__parameters:
    joints:
      - joint1
      - joint2
      - joint3
      - joint4
      - joint5
      - joint6

    command_interfaces:
      - position

    state_interfaces:
      - position
      - velocity

    action_monitor_rate: 20.0

    allow_partial_joints_goal: false
    interpolate_from_desired_state: true
    constraints:
      stopped_velocity_tolerance: 0.01
      goal_time: 0.0
      joint1:
        trajectory: 0.05
        goal: 0.03
```

#### 抢占策略（Preemption policy）[1]

任何时刻只能有一个动作目标处于活动状态，或者在使用话题接口时没有目标。路径和目标的容差只针对活动目标对应的轨迹段进行检查。

当活动动作目标被来自动作接口的另一个命令抢占时，该目标被中止并通知客户端。轨迹以明确的方式被替换，参见《轨迹替换》（trajectory replacement）。

从话题接口（而非动作接口）发送空轨迹消息将覆盖当前动作目标，但不会中止该动作。

#### 控制器接口说明

**参考接口（References）**

（该控制器尚未实现为链式控制器）

**状态接口（States）**

状态接口由 `joints` 和 `state_interfaces` 参数定义，格式为：`<joint>/<state_interface>`。

状态接口的合法组合见《硬件接口类型》一节。

**命令接口（Commands）**

向控制器发送轨迹有两种机制：

- 通过动作（action），参见《动作》；
- 通过话题（topic），参见《订阅者》。

两者都使用 `trajectory_msgs/msg/JointTrajectory` 消息来指定轨迹，并且如果 `allow_partial_joints_goal` 未设置为 `True`，都要求为控制器的所有关节（而不是仅一部分关节）指定值。有关消息格式的更多信息，请参见《轨迹表示》（trajectory representation）。

**动作（Actions）[1]**

**`<controller_name>/follow_joint_trajectory`** `[control_msgs::action::FollowJointTrajectory]`

用于命令控制器的动作服务器。

发送轨迹的主要方式是通过动作接口，当需要执行监控时，应优先使用这种方式。

动作目标不仅允许指定要执行的轨迹，还允许（可选）指定路径和目标容差。详情请参见 JointTolerance 消息：

> 容差指定位置、速度和加速度可以偏离设定值的程度。例如，在轨迹控制的情况下，当实际位置偏离超出（期望位置 + 位置容差）时，轨迹目标可能会中止。
>
> 容差有两个特殊值：
> - 0 —— 容差未指定，将保持为默认值；
> - -1 —— 容差被"擦除"。如果存在默认值，关节将被允许无限制地移动。

当未指定容差时，使用参数接口中给出的默认值（参见《参数详情》）。如果在轨迹执行期间违反容差，动作目标被中止，通知客户端，并保持当前位置。

在目标于指定容差内达到后，动作服务器向客户端返回成功，并继续执行最后一个命令点。

**订阅者（Subscriber）[1]**

**`<controller_name>/joint_trajectory`** `[trajectory_msgs::msg::JointTrajectory]`

用于命令控制器的话题。

话题接口是一种即发即弃（fire-and-forget）的替代方案。如果您不关心执行监控，请使用此接口。在这种情况下不使用目标容差规范，因为没有机制通知发送方容差违规。如果违反状态容差，轨迹被中止并保持当前位置。请注意，虽然可以通过 `~/query_state` 服务和 `~/controller_state` 话题获得某种程度的监控，但实现起来比动作接口麻烦得多。

**发布者（Publishers）**

**`<controller_name>/controller_state`** `[control_msgs::msg::JointTrajectoryControllerState]`

以 controller manager 的更新速率发布内部状态的话题。

**服务（Services）**

**`<controller_name>/query_state`** `[control_msgs::srv::QueryTrajectoryState]`

查询任意未来时间的控制器状态。

### 4.6.4 进一步信息

- 轨迹表示（Trajectory Representation）
- 轨迹替换（Trajectory Replacement）
- 取消时减速（Decelerate on cancel）
- 速度缩放（Speed scaling）
- joint_trajectory_controller 参数
- rqt_joint_trajectory_controller

---

### 4.6.5 轨迹表示（Trajectory Representation）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/joint_trajectory_controller/doc/trajectory.html>

轨迹在内部用 `trajectory_msgs/msg/JointTrajectory` 数据结构表示。

目前实现了两种插值方法：`none` 和 `spline`。默认提供一个样条插值器，但也可以支持其他表示。

> **警告**
>
> 用户必须确保为轨迹提供正确的输入，这是控制器的命令接口设置和 PID 配置所需要的。没有健全性检查，采样轨迹中缺失字段可能会导致段错误（segmentation faults）。

#### 插值方法 `none`

它返回初始点，直到到达第一个轨迹数据点的时间。然后，它简单地取下一个给定的数据点。

> **警告**
>
> 它不从导数推导（积分）轨迹，也不计算导数。即，必须按需提供位置及其导数。

#### 插值方法 `spline`

样条插值器根据航点规范使用以下插值策略：

- 线性（Linear）：
  - 仅指定位置时使用；
  - 返回位置和速度；
  - 保证位置级别的连续性；
  - 不推荐，因为它会产生在航点处速度不连续的轨迹。
- 三次（Cubic）：
  - 指定位置和速度时使用；
  - 返回位置、速度和加速度；
  - 保证速度级别的连续性。
- 五次（Quintic）：
  - 指定位置、速度和加速度时使用；
  - 返回位置、速度和加速度；
  - 保证加速度级别的连续性。

如果 `allow_integration_in_goal_trajectories` 为 true，则可以处理并接受仅包含速度字段、仅包含速度和加速度字段、或仅包含加速度字段的轨迹。此时位置（和速度）通过 Heun 方法从速度（或加速度）积分得到。

对于声明了 `effort` 命令接口的控制器，允许使用力轨迹（effort trajectories），它们被视为加到位置反馈上的前馈力（feed-forward effort）。力与位置、速度和加速度分开处理。当选择 `spline` 插值方法时，我们对力使用线性插值。

#### 可视化示例

为了可视化不同插值方法及其输入的差异，在 0.5 秒网格上定义不同的轨迹，并以 10ms 的速率采样。

- 仅给定位置时，采用线性样条采样的轨迹；
![仅位置采样轨迹](https://lux2026.oss-cn-hangzhou.aliyuncs.com/images/ros2_controllers/joint_trajectory_controller/trajectory/spline_position.png)

- 仅给定速度时，采用三次样条采样的轨迹（对于 `none` 插值方法没有推导）；
![仅速度采样轨迹](https://lux2026.oss-cn-hangzhou.aliyuncs.com/images/ros2_controllers/joint_trajectory_controller/trajectory/spline_velocity.png)

- 给定位置和速度时采样的轨迹；
![位置+速度采样轨迹](https://lux2026.oss-cn-hangzhou.aliyuncs.com/images/ros2_controllers/joint_trajectory_controller/trajectory/spline_position_velocity.png)


> **注意**
>
> 如果使用相同的积分方法（`Trajectory` 类使用 Heun 方法），则 `spline` 方法的结果与上面仅给定速度作为输入时相同。

- 仅给定加速度时，采用五次样条采样的轨迹（对于 `none` 插值方法没有推导）；
![仅加速度采样轨迹](https://lux2026.oss-cn-hangzhou.aliyuncs.com/images/ros2_controllers/joint_trajectory_controller/trajectory/spline_acceleration.png)

- 给定位置、速度和加速度点时采样的轨迹；
![位置+速度+加速度采样轨迹](https://lux2026.oss-cn-hangzhou.aliyuncs.com/images/ros2_controllers/joint_trajectory_controller/trajectory/spline_position_velocity_acceleration.png)


> **注意**
>
> 如果使用相同的积分方法（`Trajectory` 类使用 Heun 方法），则 `spline` 方法的结果与上面仅给定加速度作为输入时相同。

- 给定与上面相同的位置、速度和加速度点，但具有非零初始点时采样的轨迹；
![位置+速度+加速度，非零初始点采样轨迹](https://lux2026.oss-cn-hangzhou.aliyuncs.com/images/ros2_controllers/joint_trajectory_controller/trajectory/spline_position_velocity_acceleration_initialpoint.png)

- 给定与上面相同的位置、速度和加速度点，但第一个点在 `t=0` 开始时采样的轨迹；
![位置+速度+加速度，首点 t=0 采样轨迹](https://lux2026.oss-cn-hangzhou.aliyuncs.com/images/ros2_controllers/joint_trajectory_controller/trajectory/spline_position_velocity_acceleration_initialpoint_notime.png)


> **注意**
>
> 如果第一个点从 `t=0` 开始，则没有从初始点到轨迹的插值。

- 给定不一致的位置、速度和加速度点时，采用样条采样的轨迹；
![不一致的位置/速度/加速度点采样轨迹](https://lux2026.oss-cn-hangzhou.aliyuncs.com/images/ros2_controllers/joint_trajectory_controller/trajectory/spline_wrong_points.png)


> **注意**
>
> 插值方法 `none` 只给出下一个输入点，而 `spline` 插值方法显示出高过冲（overshoot）以匹配给定的轨迹点。

### 4.6.6 轨迹替换（Trajectory Replacement）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/joint_trajectory_controller/doc/trajectory.html>

关节轨迹消息允许通过 header 时间戳指定新轨迹开始执行的时间，其中零时间（默认）表示"立即开始"。

当前实现只是丢弃旧轨迹。关注此 issue 以获取更多信息。

---

### 4.6.7 取消时减速（Decelerate on cancel）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/joint_trajectory_controller/doc/decelerate_on_cancel.html>

默认情况下，当轨迹被取消或抢占时，控制器会立即保持当前位置。这对于高速移动的硬件可能造成问题，因为突然停止可能触发故障或造成过度磨损。

当启用 `decelerate_on_cancel` 功能时，控制器会生成一条平滑的停止轨迹，使用恒定减速度曲线将每个关节减速到零速度，然后保持位置。

_默认行为：当轨迹被取消时，控制器立即将命令位置设置为当前位置，导致突然停止。_
![默认行为：取消时立即保持位置](https://lux2026.oss-cn-hangzhou.aliyuncs.com/images/ros2_controllers/joint_trajectory_controller/decelerate_on_cancel/decelerate_hold_position.png)


_启用 decelerate on cancel：控制器生成一条斜坡停止轨迹，在保持位置前平滑地使每个关节减速。_
![启用 decelerate on cancel：平滑减速停止](https://lux2026.oss-cn-hangzhou.aliyuncs.com/images/ros2_controllers/joint_trajectory_controller/decelerate_on_cancel/decelerate_to_stop.png)


#### 工作原理

当轨迹被取消或抢占且启用了 `decelerate_on_cancel` 时，控制器：

1. 从速度状态接口读取每个关节的当前速度。
2. 使用每个关节配置的 `max_deceleration_on_cancel` 值计算停止距离和停止时间：

\\[t_{stop} = \frac{|v|}{a_{max}}\\]

\\[d_{stop} = \frac{v \cdot t_{stop}}{2}\\]

其中 \\(v\\) 是当前速度，\\(a_{max}\\) 是配置的最大减速度。

3. 生成一条轨迹，其中包含在计算的停止时间内将速度线性斜坡降到零的中间航点。
4. 在计算的停止位置追加最终的保持位置点。

每个关节根据其自身的 `max_deceleration_on_cancel` 值独立减速，但轨迹是同步的，因此所有关节在同一时间（最慢关节的停止时间）完成。

#### 要求

- 硬件必须为控制器中的所有关节提供 `velocity` 状态接口。如果速度状态反馈不可用，控制器会回退到默认的保持位置行为。
- 每个关节必须有一个有效（大于零）的 `max_deceleration_on_cancel` 值。值为 `0.0` 的关节会导致控制器回退到保持位置行为。

#### 配置

通过设置 `constraints.decelerate_on_cancel` 为 `true`，并在 `constraints.<joint_name>` 下为每个关节提供 `max_deceleration_on_cancel` 值（单位 rad/s^2 或 m/s^2）来启用该功能：

```yaml
controller_name:
  ros__parameters:
    joints:
      - joint_1
      - joint_2
      - joint_3

    constraints:
      decelerate_on_cancel: true
      stopped_velocity_tolerance: 0.01
      goal_time: 0.0
      joint_1:
        max_deceleration_on_cancel: 10.0
      joint_2:
        max_deceleration_on_cancel: 3.0
      joint_3:
        max_deceleration_on_cancel: 6.0
```

> **注意**
>
> `decelerate_on_cancel` 和 `max_deceleration_on_cancel` 都是只读参数。它们只能在控制器配置时设置，不能在运行时更改。

> **注意**
>
> 选择在硬件物理极限范围内的 `max_deceleration_on_cancel` 值。过高的值仍可能导致故障，而过低的值会导致更长的停止距离。

---

### 4.6.8 速度缩放（Speed scaling）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/joint_trajectory_controller/doc/speed_scaling.html>

`joint_trajectory_controller`（JTC）支持动态缩放其轨迹执行速度。这意味着，当指定小于 1 的缩放因子 \\(f\\) 时，每个控制周期只前进 \\(f \cdot \Delta_t\\)，其中 \\(\\Delta_t\\) 是控制器的周期时间。

#### 速度缩放的方法

一般来说，速度缩放功能设想了两种不同的缩放方法：机载缩放（On-Robot scaling）和控制器侧缩放（On-Controller scaling）。它们在概念上不同，要正确配置速度缩放，理解其差异很重要。

**机载速度缩放（On-Robot speed scaling）**

此缩放方法适用于直接在机器人示教器（teach pendant）上和/或通过安全功能提供缩放功能的机器人。此类机器人的一个例子是 Universal Robots 机械臂。

硬件接口需要通过状态接口报告速度缩放，以便控制器可以读取。可选地，可以提供一个命令接口（如果适用）来在硬件上设置速度缩放值，从而通过 ROS 话题设置速度缩放。

就本文档而言，用户定义的缩放和安全限制的缩放被视为相同，统称为"硬件缩放因子"。

在这种设置下，硬件将处理从 ROS 控制器发送的命令（例如"在 \\(\\Delta_t\\) 秒内到达关节配置 \\(\\theta\\)"）。这实际上意味着，当给定缩放因子 0.5 时，机器人只走一半的路程到达目标配置（忽略此期间的加速度和减速度影响）。

下图显示了在硬件缩放执行下、且控制器**不**感知速度缩放时的轨迹执行（针对一个关节）：
![未感知速度缩放时的轨迹执行](https://lux2026.oss-cn-hangzhou.aliyuncs.com/images/ros2_controllers/joint_trajectory_controller/speed_scaling/traj_without_speed_scaling.png)


图中显示一个关节被移动到目标点再返回起点的轨迹。由于关节速度在示教器上被限制在非常低的设置，速度缩放（黑线）被激活并限制关节速度（绿线）。结果，目标轨迹（浅蓝色）没有被机器人执行，而是执行了粉红色轨迹。浅蓝色线和粉红色线之间的垂直距离是每个控制周期内的路径误差。我们可以看到，路径偏差在某个时刻超过 300 度，且 -6 弧度的目标点从未到达。

使用缩放版本的轨迹控制器后，前图所示的示例运动变成：
![启用速度缩放后的轨迹执行](https://lux2026.oss-cn-hangzhou.aliyuncs.com/images/ros2_controllers/joint_trajectory_controller/speed_scaling/traj_with_speed_scaling.png)


ROS 侧的轨迹插值与实际机器人执行之间的偏差保持最小，机器人到达中间设定点，而不是像上面的例子那样"过早"返回。

缩放的完成方式是：轨迹中的时间被虚拟地缩放。例如，如果控制器以 100 Hz 的周期运行，每个控制周期为 10 ms。速度缩放 0.5 意味着每个时间步轨迹前进 5 ms 而不是 10 ms。因此，第 3 个时间步的开始在轨迹中是 15 ms 而不是 30 ms。

命令采样与未缩放时一样，使用时间步的开始加上**完整**的 10 ms 周期时间。机器人会将运动命令缩小 50%，导致只执行一半的距离，这就是为什么下一个控制周期将在当前开始位置加上半步时间处开始。

**控制器侧速度缩放（On-Controller speed scaling）**

从概念上讲，使用这种缩放时，机器人硬件不感知任何缩放的发生。JTC 生成发送给机器人的命令时已经相应缩小，因此可以直接由机器人执行。

由于硬件不感知速度缩放，因此不应指定与速度缩放相关的命令和状态接口，缩放因子将通过 `~/speed_scaling_input` 话题直接设置：

```
$ ros2 topic pub --qos-durability transient_local --once \
  /joint_trajectory_controller/speed_scaling_input control_msgs/msg/SpeedScalingFactor "{factor: 0.5}"
```

> **注意**
>
> `~/speed_scaling_input` 话题使用 QoS 持久性配置 `transient_local`。这意味着您可以在该话题上仍有一个发布者时重启控制器。

> **注意**
>
> 当前实现仅适用于基于位置的接口。

#### 对容差的影响

在执行轨迹时使用速度缩放，配置的执行容差也会被缩放。

由于命令是从缩放后的轨迹时间生成的，**路径误差**也将与缩放后的轨迹进行比较。

**目标时间容差**也使用虚拟轨迹时间。这意味着以恒定缩放因子 0.5 执行的轨迹，其执行时间将是最后一个轨迹点的 `time_from_start` 值所指定时间的两倍。只要机器人不超过这个时间，就认为满足目标时间容差。

如果应用程序依赖 `time_from_start` 字段中设置的实际执行时间，则必须在轨迹执行动作外面包裹一个外部监控。

---

### 4.6.9 参数详情（Details about parameters）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/joint_trajectory_controller/doc/parameters.html>

该控制器使用 generate_parameter_library 来处理其参数。位于 src 文件夹中的参数定义文件包含控制器使用的所有参数的说明。

#### 参数列表

**`joints`** (string_array)

系统的关节名称。

- 只读：True
- 默认值：{}
- 约束：不包含重复项；长度大于 0

**`command_joints`** (string_array)

要控制的关节名称。如果留空，将使用 `joints`。此参数可用于以下情况：

- JTC 在控制器链中使用，其中命令接口和状态接口名称不同；
- 命令关节的数量小于自由度。例如跟踪被动关节的状态和误差。此时 `command_joints` 必须是 `joints` 的子集。

- 只读：True
- 默认值：{}
- 约束：不包含重复项

**`command_interfaces`** (string_array)

硬件接口为所有关节提供的命令接口。

- 只读：True
- 默认值：{}
- 约束：不包含重复项；长度大于 0；每个元素是列表 [‘position’, ‘velocity’, ‘acceleration’, ‘effort’] 之一；自定义校验器：`joint_trajectory_controller::command_interface_type_combinations`

**`state_interfaces`** (string_array)

硬件为所有关节提供的状态接口。

- 只读：True
- 默认值：{}
- 约束：不包含重复项；长度大于 0；每个元素是列表 [‘position’, ‘velocity’, ‘acceleration’] 之一；自定义校验器：`joint_trajectory_controller::state_interface_type_combinations`

**`speed_scaling.initial_scaling_factor`** (double)

如果与硬件没有交换，缩放因子的初始值。

- 只读：True
- 默认值：1.0
- 约束：大于或等于 0.0

**`speed_scaling.state_interface`** (string)

速度缩放状态接口的全限定名称。

- 只读：True
- 默认值：""

**`speed_scaling.command_interface`** (string)

用于在硬件上设置速度缩放因子的命令接口名称。

- 只读：True
- 默认值：""

**`allow_partial_joints_goal`** (bool)

允许关节目标只定义部分关节的轨迹。

- 默认值：false

**`open_loop_control`** (bool)

已弃用（deprecated）：改用 `interpolate_from_desired_state` 并将反馈增益设为零。

- 只读：True
- 默认值：false

**`interpolate_from_desired_state`** (bool)

在接收到新轨迹时，从当前期望状态开始插值。

控制器忽略硬件接口提供的状态，而是使用最后命令作为状态来开始轨迹插值。

如果硬件状态不跟随命令（即两者之间存在偏移，典型于液压机械臂），这将非常有用。此外，当您有一段通过多条消息发送的参考轨迹时（例如 MPC 风格的轨迹规划），这也是必需的。

如果设置了此标志，控制器在激活时会尝试从命令接口读取值。如果它们具有真实的数值，将使用这些值而不是状态接口。因此，在硬件启动时，将命令接口设置为 NaN（即 `std::numeric_limits<double>::quiet_NaN()`）或状态值非常重要。

- 只读：True
- 默认值：false

**`allow_integration_in_goal_trajectories`** (bool)

允许在目标轨迹中进行积分，以接受未指定位置或速度的目标。

- 默认值：false

**`set_last_command_interface_value_as_state_on_activation`** (bool)

当设置为 true 时，激活时将最后的命令接口值同时用作当前状态和最后命令状态。如果某个接口（例如 velocity）只能作为状态而不能作为命令，则使用状态。当使用柔性或顺应性（soft/compliant）硬件时，使用此设置可防止激活时的下垂/跳动（sagging/jumps）。当设置为 false 时，两者都使用当前状态。

- 默认值：true

**`action_monitor_rate`** (double)

当控制器执行动作（`control_msgs::action::FollowJointTrajectory`）时，监控状态变化的速率。

- 只读：True
- 默认值：20.0
- 约束：大于或等于 0.1

**`interpolation_method`** (string)

要使用的插值类型（如果有）。

- 只读：True
- 默认值："splines"
- 约束：指定值之一：[‘splines’, ‘none’]

**`allow_nonzero_velocity_at_trajectory_end`** (bool)

如果为 false，最后一个速度点必须为零，否则目标将被拒绝。

- 默认值：false

**`cmd_timeout`** (double)

超过后输入命令被视为过期的超时时间。超时从轨迹结束（最后一个点）开始计算。`cmd_timeout` 必须大于 `constraints.goal_time`，否则被忽略。如果为零，则超时被禁用。

- 默认值：0.0

**`constraints`**

如果 `JointTrajectory` 消息中未设置显式值时的默认容差值。还包含 `decelerate_on_cancel` 选项和逐关节的 `max_deceleration_on_cancel` 值，用于平滑停止行为（参见《取消时减速》）。

**`constraints.stopped_velocity_tolerance`** (double)

轨迹结束时的速度容差，用于指示受控系统已停止。

- 默认值：0.01

**`constraints.goal_time`** (double)

在命令时间之前或之后达到轨迹目标的时间容差。如果设为零，控制器将等待潜在无限长的时间。

- 默认值：0.0
- 约束：大于或等于 0.0

**`constraints.decelerate_on_cancel`** (bool)

如果为 true 且每个关节的 max_deceleration_on_cancel 大于 0，则在请求被取消或违反目标约束时减速到停止。要求控制器中所有关节都有速度状态接口。

- 只读：True
- 默认值：false

**`constraints.<joints>.trajectory`** (double)

运动期间逐关节的轨迹偏移容差。

- 默认值：0.0

**`constraints.<joints>.goal`** (double)

目标位置处逐关节的轨迹偏移容差。

- 默认值：0.0

**`constraints.<joints>.max_deceleration_on_cancel`** (double)

逐关节的最大减速度，用于在请求被取消或抢占时计算停止位置。

- 只读：True
- 默认值：0.0
- 约束：大于或等于 0.0

**`gains`**

这些参数用于为 `velocity` 或仅 `effort` 命令接口配置 PID 回路。该结构包含每个关节的控制器增益，遵循以下控制律：

- 如果 `velocity` 是唯一的命令接口：

\\[u = k_{ff} v_d + k_p e + k_i \sum e dt + k_d (v_d - v)\\]

其中 \\(v_d\\) 是期望速度，\\(v\\) 是测量速度，\\(e\\) 是位置误差（定义见下文），\\(dt\\) 是控制器周期，\\(u\\) 是 `velocity` 操纵变量（控制变量）。

- 如果 `effort` 是唯一的命令接口：

\\[u = k_{ff} v_d + \delta_d + k_p e + k_i \sum e dt + k_d (v_d - v)\\]

其中 \\(v_d\\) 是期望速度，\\(\\delta_d\\) 是轨迹中提供的期望力（否则为 0），\\(v\\) 是测量速度，\\(e\\) 是位置误差（定义见下文），\\(dt\\) 是控制器周期，\\(u\\) 是 `effort` 操纵变量（控制变量）。

如果关节是连续类型，位置误差 \\(e = normalize(s_d - s)\\) 被归一化到 \\(-\\pi, \\pi\\) 之间，即到目标位置的最短旋转就是期望运动。否则使用 \\(e = s_d - s\\)，其中 \\(s_d\\) 是期望位置，\\(s\\) 是来自状态接口的测量位置。

如果您想关闭 PID（开环控制），请将反馈增益设为零，并为前馈增益 \\(k_{ff}\\) 设置适当的值。

**`gains.<joints>.p`** (double)

PID 的比例增益 \\(k_p\\)。

- 默认值：0.0

**`gains.<joints>.i`** (double)

PID 的积分增益 \\(k_i\\)。

- 默认值：0.0

**`gains.<joints>.d`** (double)

PID 的微分增益 \\(k_d\\)。

- 默认值：0.0

**`gains.<joints>.i_clamp`** (double)

[已弃用，改用 i_clamp_max/i_clamp_min] 积分钳位。在正负两个方向对称。

- 默认值：`std::numeric_limits<double>::infinity()`

**`gains.<joints>.i_clamp_max`** (double)

积分上限钳位。

- 默认值：`std::numeric_limits<double>::infinity()`

**`gains.<joints>.i_clamp_min`** (double)

积分下限钳位。

- 默认值：`-std::numeric_limits<double>::infinity()`

**`gains.<joints>.ff_velocity_scale`** (double)

速度的前馈缩放 \\(k_{ff}\\)。

- 默认值：0.0

**`gains.<joints>.u_clamp_max`** (double)

输出上限钳位。

- 默认值：`std::numeric_limits<double>::infinity()`

**`gains.<joints>.u_clamp_min`** (double)

输出下限钳位。

- 默认值：`-std::numeric_limits<double>::infinity()`

**`gains.<joints>.antiwindup_strategy`** (string)

指定抗饱和（anti-windup）策略。选项：‘back_calculation’、‘conditional_integration’、‘legacy’ 或 ‘none’。注意 ‘back_calculation’ 策略使用 tracking_time_constant 参数来调节抗饱和行为。

- 只读：True
- 默认值："legacy"
- 约束：指定值之一：[‘back_calculation’, ‘conditional_integration’, ‘legacy’, ‘none’]

**`gains.<joints>.tracking_time_constant`** (double)

指定 ‘back_calculation’ 策略的跟踪时间常数。当选择此策略时，如果设为 0.0，将应用一个推荐的默认值。

- 默认值：0.0

**`gains.<joints>.error_deadband`** (double)

用于在误差处于给定范围内时停止积分。

- 默认值：0.0

#### 示例参数文件

```yaml
joint_trajectory_controller:
  ros__parameters:
    action_monitor_rate: 20.0
    allow_integration_in_goal_trajectories: false
    allow_nonzero_velocity_at_trajectory_end: false
    allow_partial_joints_goal: false
    cmd_timeout: 0.0
    command_interfaces: '{}'
    command_joints: '{}'
    constraints:
      <joints>:
        goal: 0.0
        max_deceleration_on_cancel: 0.0
        trajectory: 0.0
      decelerate_on_cancel: false
      goal_time: 0.0
      stopped_velocity_tolerance: 0.01
    gains:
      <joints>:
        antiwindup_strategy: legacy
        d: 0.0
        error_deadband: 0.0
        ff_velocity_scale: 0.0
        i: 0.0
        i_clamp: std::numeric_limits<double>::infinity()
        i_clamp_max: std::numeric_limits<double>::infinity()
        i_clamp_min: -std::numeric_limits<double>::infinity()
        p: 0.0
        tracking_time_constant: 0.0
        u_clamp_max: std::numeric_limits<double>::infinity()
        u_clamp_min: -std::numeric_limits<double>::infinity()
    interpolate_from_desired_state: false
    interpolation_method: splines
    joints: '{}'
    open_loop_control: false
    set_last_command_interface_value_as_state_on_activation: true
    speed_scaling:
      command_interface: ''
      initial_scaling_factor: 1.0
      state_interface: ''
    state_interfaces: '{}'
```

---

### 4.6.10 rqt_joint_trajectory_controller

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/rqt_joint_trajectory_controller/doc/userdoc.html>

rqt_joint_trajectory_controller 提供了一种直观的图形化方式来测试不同的关节位置和轨迹，而无需手动构造复杂的轨迹消息或使用命令行接口。
![rqt_joint_trajectory_controller 界面](https://lux2026.oss-cn-hangzhou.aliyuncs.com/images/ros2_controllers/joint_trajectory_controller/rqt/rqt_joint_trajectory_controller.png)


该界面允许您：

- 从下拉菜单中选择 controller manager 命名空间和控制器；
- 使用交互式滑块调整关节（joint1 和 joint2）的目标位置；
- 通过精确的数值输入微调关节位置；
- 使用速度缩放滑块控制运动速度；
- 使用中央电源按钮激活轨迹执行；
- 实时可视化当前关节配置。


## 4.7 运动原语控制器（Motion Primitives Controllers）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/motion_primitives_controllers/doc/userdoc.html>

用于使用运动原语（motion primitives）控制机器人的包，例如 LINEAR_JOINT（PTP/MOVEJ）、LINEAR_CARTESIAN（LIN/MOVEL）和 CIRCULAR_CARTESIAN（CIRC/MOVEC）。

> **警告**
>
> 无法保证运动原语定义的运动会被精确地按计划执行。特别是对于笛卡尔空间中的运动，如 LIN 原语，不保证机器人会以那种方式精确执行运动，因为逆运动学并不总是唯一的。

### 4.7.1 命令接口和状态接口

控制器使用以下命令和状态接口来传输运动原语。所有接口都使用命名方案 `tf_prefix_ + "motion_primitive/<interface name>"`，其中 `tf_prefix` 作为参数提供给控制器。

#### 命令接口

这些接口用于向硬件接口发送运动原语数据：

- `motion_type`：运动原语的类型（LINEAR_JOINT、LINEAR_CARTESIAN、CIRCULAR_CARTESIAN）
- `q1` – `q6`：基于关节运动的关节目标位置
- `pos_x`、`pos_y`、`pos_z`：笛卡尔目标位置
- `pos_qx`、`pos_qy`、`pos_qz`、`pos_qw`：目标位姿的方向四元数
- `pos_via_x`、`pos_via_y`、`pos_via_z`：圆弧运动的中间路径点位置
- `pos_via_qx`、`pos_via_qy`、`pos_via_qz`、`pos_via_qw`：路径点的方向四元数
- `blend_radius`：平滑过渡的混合半径
- `velocity`：期望运动速度
- `acceleration`：期望运动加速度
- `move_time`：基于时间执行的（可选）持续时间（适用于 LINEAR_JOINT 和 LINEAR_CARTESIAN。如果 move_time > 0，则忽略 velocity 和 acceleration）

#### 状态接口

这些接口用于将硬件接口的内部状态传回给 `motion_primitives_forward_controller`。

- `execution_status`：指示原语的当前执行状态。可能的值为：
  - `IDLE`：没有正在进行的运动；
  - `EXECUTING`：正在执行一个原语；
  - `SUCCESS`：最后一个命令成功完成；
  - `ERROR`：执行过程中发生错误；
  - `STOPPING`：硬件接口已收到 `STOP_MOTION` 命令，但机器人尚未停止；
  - `STOPPED`：机器人已使用 `STOP_MOTION` 命令停止，在执行新命令之前必须使用 `RESET_STOP` 命令复位。
- `ready_for_new_primitive`：布尔标志，指示接口是否准备好接收新的运动原语

### 4.7.2 motion_primitives_forward_controller

该控制器使用 control_msgs 中的 `ExecuteMotionPrimitiveSequence.action` 动作，提供向工业机器人控制器发送运动原语的接口。控制器通过动作接口接收原语，并通过命令接口将其转发给特定机器人的硬件接口。目前，已实现 Universal Robots 和 KUKA Robots 的硬件接口。

- 支持的运动原语：
  - `LINEAR_JOINT`
  - `LINEAR_CARTESIAN`
  - `CIRCULAR_CARTESIAN`

如果通过动作向控制器传递多个运动原语，控制器会将它们作为序列转发给硬件接口。为此，它首先发送 `MOTION_SEQUENCE_START`，然后发送每个单独的原语，最后发送 `MOTION_SEQUENCE_END`。这两个标记之间的所有原语将作为单个、连续的序列执行。这允许原语之间无缝过渡（混合）。

动作接口还允许停止当前运动原语的执行。当收到停止请求时，控制器向硬件接口发送 `STOP_MOTION`，随后使机器人停止运动。一旦控制器收到机器人已停止的确认，它向硬件接口发送 `RESET_STOP`。之后，可以发送新命令。

例如，可以通过 Python 脚本完成此操作，如 `Universal_Robots_ROS2_Driver` 包中的 `example python script` 所示。

#### motion_primitives_forward_controller 的架构概览

- 使用 `Universal_Robots_ROS2_Driver`（运动原语模式）的 UR 机器人的架构；
- 使用 `kuka_eki_motion_primitives_hw_interface` 的 KUKA 机器人的架构。
![ExecuteMotionPrimitiveSequence 动作数据流](https://lux2026.oss-cn-hangzhou.aliyuncs.com/images/ros2_controllers/motion_primitives/Moprim_Controller_ExecuteMotion_Action.drawio.png)
![UR 机器人运动原语架构](https://lux2026.oss-cn-hangzhou.aliyuncs.com/images/ros2_controllers/motion_primitives/ros2_control_motion_primitives_ur.drawio.png)
![KUKA 机器人运动原语架构](https://lux2026.oss-cn-hangzhou.aliyuncs.com/images/ros2_controllers/motion_primitives/ros2_control_motion_primitives_kuka.drawio.png)


#### 使用 UR10e 和 motion_primitives_forward_controller 的演示视频
![UR10e 演示视频](https://lux2026.oss-cn-hangzhou.aliyuncs.com/images/ros2_controllers/motion_primitives/moprim_forward_controller_ur_demo_thumbnail.png)


#### 使用 KR3 和 motion_primitives_forward_controller 的演示视频
![KR3 演示视频](https://lux2026.oss-cn-hangzhou.aliyuncs.com/images/ros2_controllers/motion_primitives/moprim_forward_controller_kuka_demo_thumbnail.png)


### 4.7.3 参数

该控制器使用 generate_parameter_library 来处理其参数。位于 src 文件夹中的参数定义文件包含此控制器使用的所有参数的说明。

**`tf_prefix`** (string)

所有接口都使用命名方案 tf_prefix_ + motion_primitive/<interface name>。

- 只读：True
- 默认值：""

该控制器的一个示例参数文件可在 test 目录中找到：

```yaml
test_motion_primitives_forward_controller:
  ros__parameters:
    tf_prefix: ""
```

---

## 4.8 平行夹爪动作控制器（Parallel Gripper Action Controller）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/parallel_gripper_controller/doc/userdoc.html>

用于执行简单平行夹爪的 `ParallelGripperCommand` 动作的控制器。该控制器支持仅提供位置控制的夹爪，以及允许配置速度和力的夹爪。默认情况下，控制器只会声明 `{joint}/position` 接口用于控制。速度接口和力接口可以通过分别设置 `max_velocity_interface` 和 `max_effort_interface` 参数来选择性地声明。默认情况下，控制器会尝试声明 position 和 velocity 状态接口。可通过设置 `state_interfaces` 参数来配置声明的状态接口。

### 4.8.1 参数

该控制器使用 generate_parameter_library 来处理其参数。

**`action_monitor_rate`** (double)

Hz

- 只读：True
- 默认值：20.0
- 约束：大于或等于 0.1

**`joint`** (string)

- 只读：True
- 约束：参数非空

**`state_interfaces`** (string_array)

- 默认值：{"position", "velocity"}

**`goal_tolerance`** (double)

- 默认值：0.01
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
- 约束：大于或等于 0.0

**`max_effort_interface`** (string)

控制器将声明指定的力接口，例如 `robotiq_85_left_knuckle_joint/max_effort_interface`。

- 默认值：""

**`max_effort`** (double)

用于抓取（grasping）的默认力（牛顿）。

- 默认值：10.0
- 约束：大于或等于 0.0

**`max_velocity_interface`** (string)

控制器将声明指定的速度接口，例如 `robotiq_85_left_knuckle_joint/max_velocity_interface`。

- 默认值：""

**`max_velocity`** (double)

用于抓取（grasping）的默认目标速度（米/秒）。

- 默认值：0.1
- 约束：大于或等于 0.0

---

## 4.9 PID 控制器（PID Controller）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/pid_controller/doc/userdoc.html>

使用 control_toolbox 包中 PidROS 实现的 PID 控制器实现。该控制器可以通过话题直接发送参考值，也可以在链式结构中带前置或后置控制器使用。它还支持使用参考值的一阶导数及其反馈来实现二阶 PID 控制。

根据硬件的参考/状态和命令接口，应使用不同的 PidROS 参数设置，例如：

- 参考/状态 POSITION；命令 VELOCITY → PI 控制器
- 参考/状态 VELOCITY；命令 ACCELERATION → PI 控制器
- 参考/状态 VELOCITY；命令 POSITION → PD 控制器
- 参考/状态 ACCELERATION；命令 VELOCITY → PD 控制器
- 参考/状态 POSITION；命令 POSITION → PID 控制器
- 参考/状态 VELOCITY；命令 VELOCITY → PID 控制器
- 参考/状态 ACCELERATION；命令 ACCELERATION → PID 控制器
- 参考/状态 EFFORT；命令 EFFORT → PID 控制器

> **注意**
>
> 理论上，可以滥用关节轨迹控制器（JTC）来达到同样的目的，只需向它发送一个参考点。然而，不推荐这样做。如果您需要使用线性、三次或五次插值在轨迹点之间插值，则应使用 JTC。PID 控制器不做这些。JTC 的 PID 项有不同的用途——它使仅命令 `velocity` 或 `effort` 接口到硬件成为可能。

### 4.9.1 控制器的执行逻辑

控制器也可以以"前馈"（feed-forward）模式使用，其中前馈增益用于提高控制器的动态响应。如果使用一种参考和状态接口类型，则只使用即时误差。如果有两种，则第二种接口类型被视为第一种类型的一阶导数。例如，一个合法的组合是 `position` 和 `velocity` 接口类型。

### 4.9.2 使用控制器

- Pluginlib 库：pid_controller
- 插件名称：pid_controller/PidController

### 4.9.3 控制器接口说明

#### 参考接口（来自前置控制器）

- `<reference_and_state_dof_names[i]>/<reference_and_state_interfaces[j]>` `[double]` **注意**：`reference_and_state_dof_names[i]` 可以来自 `reference_and_state_dof_names` 参数，如果为空，则来自 `dof_names`。

#### 命令接口（Commands）

- `<dof_names[i]>/<command_interface>` `[double]`

#### 状态接口（States）

- `<reference_and_state_dof_names[i]>/<reference_and_state_interfaces[j]>` `[double]` **注意**：`reference_and_state_dof_names[i]` 可以来自 `reference_and_state_dof_names` 参数，如果为空，则来自 `dof_names`。

#### 订阅者

如果控制器不处于链式模式（`in_chained_mode == false`）：

- `<controller_name>/reference` `[control_msgs/msg/MultiDOFCommand]`

如果控制器参数 `use_external_measured_states` 为 true：

- `<controller_name>/measured_state` `[control_msgs/msg/MultiDOFCommand]`

#### 服务

- `<controller_name>/set_feedforward_control` `[std_srvs/srv/SetBool]`

> **警告**
>
> 该服务将被弃用，取而代之的是将 `feedforward_gain` 参数设置为非零值。

#### 发布者

- `<controller_name>/controller_state` `[control_msgs/msg/MultiDOFStateStamped]`
- `<controller_name>/<dof>/pid_state` `[control_msgs/msg/PidState]`

最初 PidState 发布者是关闭的。可以通过 `gains.<dof>.activate_state_publisher` 参数打开。

#### 参数

PID 控制器使用 generate_parameter_library 来处理其参数。

> **警告**
>
> 参数 `enable_feedforward` 将被弃用，取而代之的是将 `feedforward_gain` 参数设置为非零值。如果当前 `feedforward_gain` 设置为非零值但未激活，这将来可能导致不同的行为。

**`dof_names`** (string_array)

指定控制器使用的 dof_names 或轴。如果定义了 `reference_and_state_dof_names` 参数，则此参数只定义命令 dof 名称。

- 只读：True
- 默认值：{}
- 约束：不包含重复项；参数非空

**`reference_and_state_dof_names`** (string_array)

（可选）指定用于获取参考值和读取状态的 dof_names 或轴。该参数仅当状态 dof 名称与命令 dof 名称不同时（即使用后置控制器时）相关。

- 只读：True
- 默认值：{}
- 约束：不包含重复项

**`command_interface`** (string)

控制器用于向硬件写入命令的接口名称。

- 只读：True
- 默认值：""
- 约束：参数非空

**`reference_and_state_interfaces`** (string_array)

控制器用于获取硬件状态和参考命令的接口名称。第二个接口应是第一个接口的导数。

- 只读：True
- 默认值：{}
- 约束：参数非空；长度大于 0；长度小于 3

**`set_current_state_as_first_setpoint`** (bool)

为 true 时，控制器激活时将当前状态设置为第一个设定点。这有助于避免控制器启动时出现较大的初始误差和控制输出的突然跳变。

- 只读：True
- 默认值：true

**`use_external_measured_states`** (bool)

使用来自话题的外部状态，而不是来自状态接口。

- 默认值：false

**`enable_feedforward`** (bool)

启用前馈增益。（将弃用，取而代之的是将 feedforward_gain 设置为非零值。）

- 默认值：false

**`gains.<dof_names>.p`** (double)

PID 的比例增益。

- 默认值：0.0

**`gains.<dof_names>.i`** (double)

PID 的积分增益。

- 默认值：0.0

**`gains.<dof_names>.d`** (double)

PID 的微分增益。

- 默认值：0.0

**`gains.<dof_names>.u_clamp_max`** (double)

输出上限钳位。

- 默认值：`std::numeric_limits<double>::infinity()`

**`gains.<dof_names>.u_clamp_min`** (double)

输出下限钳位。

- 默认值：`-std::numeric_limits<double>::infinity()`

**`gains.<dof_names>.antiwindup`** (bool)

[已弃用，见 antiwindup_strategy] 抗饱和功能。设置为 true 时，限制积分误差以防止饱和；否则，限制积分对控制输出的贡献。i_clamp_max 和 i_clamp_min 在两种情况下都会应用。

- 默认值：false

**`gains.<dof_names>.i_clamp_max`** (double)

[已弃用，见 antiwindup_strategy] 积分上限钳位。

- 默认值：`std::numeric_limits<double>::infinity()`

**`gains.<dof_names>.i_clamp_min`** (double)

[已弃用，见 antiwindup_strategy] 积分下限钳位。

- 默认值：`-std::numeric_limits<double>::infinity()`

**`gains.<dof_names>.antiwindup_strategy`** (string)

指定抗饱和（anti-windup）策略。选项：‘back_calculation’、‘conditional_integration’、‘legacy’ 或 ‘none’。注意 ‘back_calculation’ 策略使用 tracking_time_constant 参数来调节抗饱和行为。

- 默认值："legacy"
- 约束：指定值之一：[‘back_calculation’, ‘conditional_integration’, ‘legacy’, ‘none’]

**`gains.<dof_names>.tracking_time_constant`** (double)

指定 ‘back_calculation’ 策略的跟踪时间常数。当选择此策略时，如果设为 0.0，将应用一个推荐的默认值。

- 默认值：0.0

**`gains.<dof_names>.error_deadband`** (double)

用于在误差处于给定范围内时停止积分。

- 默认值：1e-16

**`gains.<dof_names>.feedforward_gain`** (double)

前馈部分的增益。

- 默认值：0.0

**`gains.<dof_names>.angle_wraparound`** (bool)

用于会缠绕（即连续）的关节。将位置误差归一化到 -pi 到 pi 之间。

- 默认值：false

**`gains.<dof_names>.save_i_term`** (bool)

指示重新激活后是否保留积分项。

- 默认值：true

**`gains.<dof_names>.activate_state_publisher`** (bool)

每个 DOF 单独的状态发布器激活。如果为 true，控制器将每个 DOF 的状态发布到话题 `/<controller_name>/<dof_name>/pid_state`。

- 默认值：false

#### 示例参数文件

可在 test 文件夹（独立模式）中找到该控制器的示例参数文件：

```yaml
/**:
  ros__parameters:
# TODO(christohfroehlich): Remove this global parameters once the deprecated antiwindup parameters are removed.
    gains:
      joint1: {antiwindup_strategy: "none",}
      joint2: {antiwindup_strategy: "none",}

test_pid_controller:
  ros__parameters:
    dof_names:
      - joint1

    command_interface: position

    reference_and_state_interfaces: ["position"]

    set_current_state_as_first_setpoint: true

    gains:
      joint1: {p: 1.0, i: 2.0, d: 3.0, u_clamp_max: 5.0, u_clamp_min: -5.0}

test_pid_controller_unlimited:
  ros__parameters:
    dof_names:
      - joint1

    command_interface: position

    reference_and_state_interfaces: ["position"]

    set_current_state_as_first_setpoint: true

    gains:
      joint1: {p: 1.0, i: 2.0, d: 3.0}

test_pid_controller_angle_wraparound_on:
  ros__parameters:
    dof_names:
      - joint1

    command_interface: position

    reference_and_state_interfaces: ["position"]

    set_current_state_as_first_setpoint: true

    gains:
      joint1: {p: 1.0, i: 2.0, d: 3.0, angle_wraparound: true}

test_pid_controller_with_feedforward_gain:
  ros__parameters:
    dof_names:
      - joint1

    command_interface: position

    reference_and_state_interfaces: ["position"]

    set_current_state_as_first_setpoint: true

    gains:
      joint1: {p: 0.5, i: 0.0, d: 0.0, feedforward_gain: 1.0}

test_pid_controller_with_feedforward_gain_dual_interface:
  ros__parameters:
    dof_names:
      - joint1
      - joint2

    command_interface: velocity

    reference_and_state_interfaces: ["position", "velocity"]

    set_current_state_as_first_setpoint: true

    gains:
      joint1: {p: 0.5, i: 0.3, d: 0.4, feedforward_gain: 1.0}
      joint2: {p: 0.5, i: 0.3, d: 0.4, feedforward_gain: 1.0}

test_save_i_term_off:
  ros__parameters:
    dof_names:
      - joint1

    command_interface: position

    reference_and_state_interfaces: ["position"]

    set_current_state_as_first_setpoint: true

    gains:
      joint1: {p: 1.0, i: 2.0, d: 3.0, save_i_term: false}

test_save_i_term_on:
  ros__parameters:
    dof_names:
      - joint1

    command_interface: position

    reference_and_state_interfaces: ["position"]

    set_current_state_as_first_setpoint: true

    gains:
      joint1: {p: 1.0, i: 2.0, d: 3.0, save_i_term: true}

test_pid_controller_no_first_setpoint:
  ros__parameters:
    dof_names:
      - joint1

    command_interface: position

    reference_and_state_interfaces: ["position"]

    set_current_state_as_first_setpoint: false

    gains:
      joint1: {p: 1.0, i: 2.0, d: 3.0, u_clamp_max: 5.0, u_clamp_min: -5.0}
```

或作为前置控制器：

```yaml
test_pid_controller:
  ros__parameters:
    dof_names:
      - joint1

    command_interface: position

    reference_and_state_interfaces: ["position"]

    reference_and_state_dof_names:
      - joint1state

    gains:
      joint1: {antiwindup_strategy: "none"}
```

---

## 4.10 位置控制器（Position Controllers）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/position_controllers/doc/userdoc.html>

这是一组使用"position"关节命令接口工作的控制器集合，但可以在控制器层面接受不同的关节级命令，例如控制某个关节上的位置以实现设定的速度。

该包包含以下控制器：

### 4.10.1 position_controllers/JointGroupPositionController

这是 forward_command_controller 的一个特化实现，使用"position"关节接口工作。

#### 控制器的 ROS 2 接口

**话题**

**`~/commands`**（输入话题）`[std_msgs::msg::Float64MultiArray]`

关节的位置命令。

**参数**

该控制器覆盖了 forward_command_controller 的 interface 参数，并且 `joints` 参数是唯一必需的参数。

此处给出一个示例参数文件：

```yaml
controller_manager:
  ros__parameters:
    update_rate: 100  # Hz

    position_controller:
      type: position_controllers/JointGroupPositionController

position_controller:
  ros__parameters:
    joints:
      - slider_to_cart
```

---

## 4.11 速度控制器（Velocity Controllers）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/velocity_controllers/doc/userdoc.html>

这是一组使用"velocity"关节命令接口工作的控制器集合，但可以在控制器层面接受不同的关节级命令，例如控制某个关节上的速度以实现设定的位置。

该包包含以下控制器：

### 4.11.1 velocity_controllers/JointGroupVelocityController

这是 forward_command_controller 的一个特化实现，使用"velocity"关节接口工作。

#### 控制器的 ROS 2 接口

**话题**

**`~/commands`**（输入话题）`[std_msgs::msg::Float64MultiArray]`

关节的速度命令。

**参数**

该控制器覆盖了 forward_command_controller 的 interface 参数，并且 `joints` 参数是唯一必需的参数。

此处给出一个示例参数文件：

```yaml
controller_manager:
  ros__parameters:
    update_rate: 100  # Hz

    velocity_controller:
      type: velocity_controllers/JointGroupVelocityController

velocity_controller:
  ros__parameters:
    joints:
      - slider_to_cart
```


# 5. 广播器（Broadcasters）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/doc/controllers_index.html>

广播器用于将硬件组件的传感器数据发布到 ROS 话题。在 ros2_control 的意义上，广播器仍然是使用与上述其他控制器相同控制器接口的控制器。

## 5.1 力/力矩传感器广播器（Force Torque Sensor Broadcaster）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/force_torque_sensor_broadcaster/doc/userdoc.html>

用于机器人或传感器的力/力矩状态接口消息的广播器。发布的消息类型是 `geometry_msgs/msg/WrenchStamped`。

广播器还支持使用滤波器链（filter chain）对力/力矩读数进行滤波，从而能够顺序应用多个滤波器。在这种情况下，会额外发布一个带有 `_filtered` 后缀的话题，包含最终结果。有关滤波器的更多详情，请参阅 filters 包仓库。关于如何配置具有任意数量滤波器的滤波器链，请参见参数部分。

该控制器是 `ForceTorqueSensor` 语义组件（见 `controller_interface` 包）的包装器。

### 5.1.1 参数

该控制器使用 generate_parameter_library 来处理其参数。位于 src 文件夹中的参数定义文件包含控制器使用的所有参数的说明。

接口可以通过两种方式定义，使用 `sensor_name` 或 `interface_names` 参数：这两个参数不能同时定义。

滤波器链在 `sensor_filter_chain` 参数下配置为滤波器的顺序列表，其中每个滤波器由键 `filterN` 标识，`N` 表示其在链中的位置（例如 `filter1`、`filter2` 等）。每个滤波器条目必须指定插件的 `name` 和 `type`，以及该特定滤波器插件所需的任何附加参数。该链将在运行时使用 pluginlib 库加载每个滤波器，并传递指定的参数。

该链顺序处理数据，将一个滤波器的输出作为下一个滤波器的输入。

完整参数列表：

**`frame_id`** (string)

传感器发布值所在的 frame_id。

- 默认值：""
- 约束：参数非空

**`sensor_name`** (string)

在没有定义单独的接口名称时，用作接口前缀的传感器名称。如果使用，将使用 6D FTS 的标准接口名称：`<sensor_name>/force.x, ..., <sensor_name>/torque.z`。

- 默认值：""

**`interface_names`**

（可选）定义自定义的、逐轴的接口名称。当使用不同的前缀（即传感器名称）或非标准接口名称时使用。只需定义一个 `interface_name` 即可。这使广播器能够使用少于六个测量轴的力传感单元。示例定义：

```yaml
interface_names:
  force:
    x: example_name/example_interface
```

**`interface_names.force.x`** (string)

'x' 轴上具有力值的状态接口名称。

- 默认值：""

**`interface_names.force.y`** (string)

'y' 轴上具有力值的状态接口名称。

- 默认值：""

**`interface_names.force.z`** (string)

'z' 轴上具有力值的状态接口名称。

- 默认值：""

**`interface_names.torque.x`** (string)

绕 'x' 轴具有力矩值的状态接口名称。

- 默认值：""

**`interface_names.torque.y`** (string)

绕 'y' 轴具有力矩值的状态接口名称。

- 默认值：""

**`interface_names.torque.z`** (string)

绕 'z' 轴具有力矩值的状态接口名称。

- 默认值：""

**`offset.force.x`** (double)

'x' 轴力值的偏移量。

- 默认值：0.0

**`offset.force.y`** (double)

'y' 轴力值的偏移量。

- 默认值：0.0

**`offset.force.z`** (double)

'z' 轴力值的偏移量。

- 默认值：0.0

**`offset.torque.x`** (double)

绕 'x' 轴力矩值的偏移量。

- 默认值：0.0

**`offset.torque.y`** (double)

绕 'y' 轴力矩值的偏移量。

- 默认值：0.0

**`offset.torque.z`** (double)

绕 'z' 轴力矩值的偏移量。

- 默认值：0.0

**`multiplier.force.x`** (double)

'x' 轴力值的乘数。

- 默认值：1.0

**`multiplier.force.y`** (double)

'y' 轴力值的乘数。

- 默认值：1.0

**`multiplier.force.z`** (double)

'z' 轴力值的乘数。

- 默认值：1.0

**`multiplier.torque.x`** (double)

绕 'x' 轴力矩值的乘数。

- 默认值：1.0

**`multiplier.torque.y`** (double)

绕 'y' 轴力矩值的乘数。

- 默认值：1.0

**`multiplier.torque.z`** (double)

绕 'z' 轴力矩值的乘数。

- 默认值：1.0

**`sensor_filter_chain`**

定义滤波器链的参数映射，以 filterN 为键。每个滤波器的字段有：type：要加载的滤波器插件；name：语义上描述滤波器的实际名称，例如 low_pass_filter；params：特定滤波器所需的底层参数映射，请参阅具体滤波器文档。

该控制器的一个示例参数文件可在 test 目录中找到：

```yaml
test_force_torque_sensor_broadcaster:
  ros__parameters:
    frame_id:  "fts_sensor_frame"
test_force_torque_sensor_broadcaster_with_chain:
  ros__parameters:
    frame_id:  "fts_sensor_frame"
    sensor_name: "fts_sensor"
    sensor_filter_chain:
      filter1:
        name: dummy
        type: filters/IncrementFilterWrench
```

## 5.2 力/力矩变换节点（Wrench Transformer Node）

该包提供了一个独立的 ROS 2 节点 `wrench_transformer_node`，使用 TF2 将 `ForceTorqueSensorBroadcaster` 控制器发布的力/力矩消息变换到不同的目标帧。当应用程序需要传感器帧之外的其他坐标系中的力/力矩数据时，这很有用。

该节点订阅来自广播器的力/力矩消息（原始或滤波），并为每个目标帧发布到单独的话题。

#### 用法

可以通过直接将目标帧作为位置参数传递来启动力/力矩变换器：

```
ros2 run force_torque_sensor_broadcaster wrench_transformer_node frame1 frame2
```

目标帧也可以通过 `target_frames` 参数设置：

```
ros2 run force_torque_sensor_broadcaster wrench_transformer_node \
  --ros-args -p target_frames:="['frame1','frame2']"
```

当同时提供两者时，位置参数覆盖参数值。

#### 力/力矩变换器参数

力/力矩变换器使用 generate_parameter_library 来处理其参数。力/力矩变换器的参数定义文件包含所有参数的说明。

**`target_frames`** (string_array)

要将输入力/力矩变换到的目标帧名称数组。对于每个帧，将发布一个单独的输出话题。

- 默认值：{}
- 约束：参数非空

**`tf_timeout`** (double)

在帧之间变换力/力矩时 TF 查找的超时时间（秒）。

- 默认值：0.1

#### 话题

节点订阅：

- `~/wrench`（原始力/力矩消息）。要订阅滤波后的力/力矩消息，请使用话题重映射：`ros2 run ... --ros-args -r ~/wrench:=<namespace>/wrench_filtered`

节点发布：

- 对于 `target_frames` 中指定的每个目标帧，发布 `<namespace>/<target_frame>/wrench`：
  - 如果节点在根命名空间（`/`）中，命名空间默认为节点名称（例如 `/fts_wrench_transformer/<target_frame>/wrench`）；
  - 如果输入话题被重映射到滤波话题（名称中包含 "filtered"），输出话题会自动追加 `_filtered` 后缀（例如 `<namespace>/<target_frame>/wrench_filtered`）；
  - 这允许用户区分变换后的原始力/力矩数据和变换后的滤波力/力矩数据。

---

## 5.3 IMU 传感器广播器（IMU Sensor Broadcaster）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/imu_sensor_broadcaster/doc/userdoc.html>

来自 IMU 传感器消息的广播器。发布的消息类型是 `sensor_msgs/msg/Imu`。

该控制器是 `IMUSensor` 语义组件（见 `controller_interface` 包）的包装器。

### 5.3.1 参数

该控制器使用 generate_parameter_library 来处理其参数。位于 src 文件夹中的参数定义文件包含控制器使用的所有参数的说明。

#### 参数列表

**`sensor_name`** (string)

定义用作其接口前缀的传感器名称。接口名称是：`<sensor_name>/orientation.x, ..., <sensor_name>/angular_velocity.x, ..., <sensor_name>/linear_acceleration.x`。

- 默认值：""
- 约束：参数非空

**`frame_id`** (string)

传感器发布值所在的 frame_id。

- 默认值：""
- 约束：参数非空

**`static_covariance_orientation`** (double_array)

静态方向协方差。关于 x、y、z 轴按行主序排列。

- 默认值：{0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0}
- 约束：长度必须等于 9

**`static_covariance_angular_velocity`** (double_array)

静态角速度协方差。关于 x、y、z 轴按行主序排列。

- 默认值：{0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0}
- 约束：长度必须等于 9

**`static_covariance_linear_acceleration`** (double_array)

静态线加速度协方差。关于 x、y、z 轴按行主序排列。

- 默认值：{0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0}
- 约束：长度必须等于 9

#### 示例参数文件

该控制器的一个示例参数文件可在 test 目录中找到：

```yaml
test_imu_sensor_broadcaster:
  ros__parameters:

    sensor_name: "imu_sensor"
    frame_id:  "imu_sensor_frame"
```

---

## 5.4 关节状态广播器（Joint State Broadcaster）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/joint_state_broadcaster/doc/userdoc.html>

该广播器读取所有状态接口，并在 `/joint_states` 和 `/dynamic_joint_states` 上报告它们。

### 5.4.1 命令

广播器不是真正的控制器，因此不接受命令。

### 5.4.2 硬件接口类型

默认情况下，除非另有配置，否则使用所有可用的 _关节状态接口_。在后一种情况下，结果接口由 `joints` 和 `interfaces` 参数的叉积定义的接口"矩阵"来确定。如果某些请求的接口缺失，控制器会打印有关此问题的警告，但会为其他接口工作。如果请求的接口都没有定义，控制器在激活时返回错误。

### 5.4.3 发布的话题

- `/joint_states`（`sensor_msgs/msg/JointState`）：
  仅为提供这些接口的关节发布 _与运动相关_ 的接口——`position`、`velocity` 和 `effort`。如果关节没有暴露某个运动接口，该字段在该关节的消息中被省略/留空。

- `/dynamic_joint_states`（`control_msgs/msg/DynamicJointState`）：
  为每个关节发布 **所有可用的状态接口**。这包括运动接口（position/velocity/effort）_以及_ 硬件提供的任何附加或自定义接口（例如温度、电压、力矩传感器读数、校准标志）。

该消息将 `joint_names` 映射到逐关节的接口名称列表和值。示例负载：

```
joint_names: [joint1, joint2]
interface_values:
  - interface_names: [position, velocity, effort]
    values: [1.5708, 0.0, 0.20]
  - interface_names: [position, temperature]
    values: [0.7854, 42.1]
```

如果您需要 _每一个_ 报告的接口（而不仅仅是运动相关的），请使用此话题。

> **注意**
>
> 如果 `use_local_topics` 设为 `true`，两个话题都在控制器的命名空间中发布（例如 `/my_state_broadcaster/joint_states` 和 `/my_state_broadcaster/dynamic_joint_states`）。如果为 `false`（默认），则在根命名空间发布（例如 `/joint_states`）。

### 5.4.4 参数

该控制器使用 generate_parameter_library 来处理其参数。位于 src 文件夹中的参数定义文件包含控制器使用的所有参数的说明。

#### 参数列表

**`use_local_topics`** (bool)

定义是否将 `joint_states` 和 `dynamic_joint_states` 消息发布到本地命名空间，例如 `/my_state_broadcaster/joint_states`。

- 只读：True
- 默认值：false

**`joints`** (string_array)

支持仅广播特定关节和接口的参数。必须与 `interfaces` 参数结合使用。如果 `joints` 或 `interfaces` 任一为空，将发布所有可用的状态接口。关节状态广播器请求访问所有已定义关节的所有已定义接口。

- 只读：True
- 默认值：{}

**`extra_joints`** (string_array)

要添加到 `joint_states` 和 `dynamic_joint_states` 且状态设为 0 的额外关节名称。

- 只读：True
- 默认值：{}

**`interfaces`** (string_array)

支持仅广播特定关节和接口的参数。必须与 `joints` 参数结合使用。如果 `joints` 或 `interfaces` 任一为空，将发布所有可用的状态接口。如果此参数包含 `position`、`velocity` 或 `effort`，则相应的 `map_interface_to_joint_state.<field>` 设置将被忽略，因为标准接口已被直接请求。仅当这种被忽略的映射被设置为不同的自定义接口名称时，才会打印警告。

- 只读：True
- 默认值：{}

**`map_interface_to_joint_state`**

（可选）参数（映射），提供自定义接口名称到 `joint_states` 消息中标准字段的映射。使用场景：

1. 液压机器人，其反馈和命令值通常有偏移，并且常依赖开环控制。通常在框架中把两个值映射到单独的接口。为了在 RViz 中可视化这些数据，会使用多个 joint_state_broadcaster 实例和 robot_state_publishers 来同时显示两个值。
2. 机器人为其关节值提供多种测量技术，导致值略有不同。通常在框架中使用单独的接口来提供这些值。使用多个 joint_state_broadcaster 实例，我们可以在 RViz 中同时发布和显示两者。

格式（每行可选）：

```yaml
map_interface_to_joint_state:
    position: <custom_interface>
    velocity: <custom_interface>
    effort: <custom_interface>
```

如果 `interfaces` 显式包含 `position`、`velocity` 或 `effort`，则相应的 `map_interface_to_joint_state` 条目被忽略，因为标准接口已被直接请求。在这种错误配置中，仅当配置的映射值与标准接口名称不同时才打印警告。

示例：

```yaml
map_interface_to_joint_state:
    position: kf_estimated_position
```

```yaml
map_interface_to_joint_state:
    velocity: derived_velocity
    effort: derived_effort
```

```yaml
map_interface_to_joint_state:
    effort: torque_sensor
```

```yaml
map_interface_to_joint_state:
    effort: current_sensor
```

**`map_interface_to_joint_state.position`** (string)

- 只读：True
- 默认值："position"

**`map_interface_to_joint_state.velocity`** (string)

- 只读：True
- 默认值："velocity"

**`map_interface_to_joint_state.effort`** (string)

- 只读：True
- 默认值："effort"

**`use_urdf_to_filter`** (bool)

使用 robot_description 过滤 `joint_states` 话题。如果为 true，广播器将只发布 URDF 中存在的关节的数据。如果为 false，广播器将发布任何类型为 `position`、`velocity` 或 `effort` 的接口的数据。

- 只读：True
- 默认值：true

**`frame_id`** (string)

在发布的关节状态中使用的 frame_id。该参数允许 rviz2 可视化关节的力。

- 只读：True
- 默认值："base_link"

**`publish_dynamic_joint_states`** (bool)

是否发布动态关节状态。

- 只读：True
- 默认值：true

#### 示例参数文件

```yaml
joint_state_broadcaster:
  ros__parameters:
    extra_joints: '{}'
    frame_id: base_link
    interfaces: '{}'
    joints: '{}'
    map_interface_to_joint_state:
      effort: effort
      position: position
      velocity: velocity
    publish_dynamic_joint_states: true
    use_local_topics: false
    use_urdf_to_filter: true
```

### 5.4.5 消息中关节的顺序

消息中关节的顺序可以由 3 种不同的参数设置决定：

1. 未定义 `joints` 参数且 `use_urdf_to_filter` 设为 `false`：
   消息中关节的顺序与资源管理器（resource manager）中注册的关节状态接口的顺序相同。这通常是硬件组件被加载和配置的顺序。

2. 未定义 `joints` 参数且 `use_urdf_to_filter` 设为 `true`：
   消息中关节的顺序与 URDF 文件中关节的顺序相同，它继承自加载的 URDF 模型，与 ros2_control 标签中的顺序无关。

3. 定义了 `joints` 参数和 `interfaces` 参数：
   消息中关节的顺序与 `joints` 参数中关节的顺序相同。

如果 `joints` 参数是 URDF（或总可用状态接口）中关节的子集，则消息中只发布 `joints` 参数中的关节。

如果所定义的 `joints` 参数和 `interfaces` 参数的组合不在可用的状态接口中，控制器将无法激活。

> **注意**
>
> 如果设置了 `extra_joints` 参数，`extra_joints` 参数中的关节会追加到消息中关节名称的末尾。

---

## 5.5 测距传感器广播器（Range Sensor Broadcaster）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/range_sensor_broadcaster/doc/userdoc.html>

来自测距传感器消息的广播器。发布的消息类型是 `sensor_msgs/msg/Range`。

该控制器是 `RangeSensor` 语义组件（见 `controller_interface` 包）的包装器。

### 5.5.1 参数

测距传感器广播器使用 generate_parameter_library 来处理其参数。位于 src 文件夹中的参数定义文件包含控制器使用的所有参数的说明。

#### 参数列表

**`sensor_name`** (string)

在没有定义单独的接口名称时，用作接口前缀的传感器名称。

- 默认值：""

**`frame_id`** (string)

传感器发布值所在的 frame_id。

- 默认值：""

**`radiation_type`** (int)

传感器使用的辐射类型 / 0 = 超声波（Ultrason）/ 1 = 红外（Infrared）。

- 默认值：0

**`field_of_view`** (double)

距离读数有效的弧大小 [rad]。

- 默认值：0.52

**`min_range`** (double)

最小距离值 [m]。

- 默认值：0.52

**`max_range`** (double)

最大距离值 [m]。

- 默认值：4.0

**`variance`** (double)

距离值的方差。

- 默认值：0.0

#### 示例参数文件

```yaml
range_sensor_broadcaster:
  ros__parameters:
    field_of_view: 0.52
    frame_id: ''
    max_range: 4.0
    min_range: 0.52
    radiation_type: 0.0
    sensor_name: ''
    variance: 0.0
```

该控制器的一个示例参数文件可在 test 目录中找到：

```yaml
test_range_sensor_broadcaster:
  ros__parameters:
    # Setting mendatory parameters
    sensor_name: "range_sensor"
    frame_id: "range_sensor_frame"

    # Setting parameters with changed default value to check those are used
    radiation_type: 1
    field_of_view: 0.1
    min_range: 0.10
    max_range: 7.0
    variance: 1.0
```

---

## 5.6 位姿广播器（Pose Broadcaster）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/pose_broadcaster/doc/userdoc.html>

用于机器人或传感器测量的位姿的广播器。位姿以 `geometry_msgs/msg/PoseStamped` 消息发布，并可选地以 tf 变换发布。

该控制器是 `PoseSensor` 语义组件（见 `controller_interface` 包）的包装器。

### 5.6.1 参数

该控制器使用 generate_parameter_library 来处理其参数。位于 src 文件夹中的参数定义文件包含控制器使用的所有参数的说明。

#### 参数列表

**`frame_id`** (string)

发布值所在的 frame_id。

- 默认值：""
- 约束：参数非空

**`pose_name`** (string)

用作控制器接口前缀的基本名称。状态接口名称是：`<pose_name>/position.x, ..., <pose_name>/position.z, <pose_name>/orientation.x, ..., <pose_name>/orientation.w`。

- 默认值：""
- 约束：参数非空

**`tf.enable`** (bool)

是否将位姿作为 tf 变换发布。

- 默认值：true

**`tf.child_frame_id`** (string)

发布的 tf 变换的子帧 id。如果留空，默认为 `pose_name`。

- 默认值：""

**`tf.publish_rate`** (double)

限制 tf 变换发布速率的速率（Hz）。如果设为 0，则不进行限制。此参数已弃用，不应再进行限制。

- 默认值：0.0
- 约束：大于或等于 0.0

#### 示例参数文件

该控制器的一个示例参数文件可在 test 目录中找到：

```yaml
test_pose_broadcaster:
  ros__parameters:
    pose_name: "test_pose"
    frame_id: "pose_frame"
```

---

## 5.7 GPS 传感器广播器（GPS Sensor Broadcaster）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/gps_sensor_broadcaster/doc/userdoc.html>

来自 GPS 传感器消息的广播器。发布的消息类型是 `sensor_msgs/msg/NavSatFix`。

该控制器是 `GPSSensor` 语义组件（见 `controller_interface` 包）的包装器。

### 5.7.1 参数

该控制器使用 generate_parameter_library 来处理其参数。位于 src 文件夹中的参数定义文件包含控制器使用的所有参数的说明。

#### 参数列表

**`sensor_name`** (string)

定义用作其接口前缀的传感器名称。接口名称是：`<sensor_name>/orientation.x, ..., <sensor_name>/angular_velocity.x, ..., <sensor_name>/linear_acceleration.x`。

- 默认值：""
- 约束：参数非空

**`frame_id`** (string)

传感器发布值所在的 frame_id。

- 默认值：""
- 约束：参数非空

**`static_position_covariance`** (double_array)

静态位置协方差。

- 默认值：{0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0}
- 约束：长度必须等于 9

**`read_covariance_from_interface`** (bool)

从状态接口读取协方差。

- 默认值：false

#### 示例参数文件

该控制器的一个示例参数文件可在 test 目录中找到：

```yaml
test_gps_sensor_broadcaster:
  ros__parameters:
    sensor_name: gps_sensor
    frame_id: gps_sensor_frame
    service: service_gps
```

---

## 5.8 状态接口广播器（State Interfaces Broadcaster）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/state_interfaces_broadcaster/doc/userdoc.html>

状态接口广播器发布指定硬件接口的状态（double 数据类型）。广播器发布两个话题：

- `/state_interfaces_broadcaster/names`：以 `control_msgs/msg/Keys` 消息类型发布正在监控的硬件接口的名称；
- `/state_interfaces_broadcaster/values`：以 `control_msgs/msg/Float64Values` 消息类型发布指定硬件接口的当前状态值。

### 5.8.1 参数

该控制器使用 generate_parameter_library 来处理其参数。位于 src 文件夹中的参数定义文件包含控制器使用的所有参数的说明。

#### 参数列表

**`interfaces`** (string_array)

接口状态广播器要发布的硬件接口信息列表。

- 只读：True
- 默认值：{}
- 约束：参数非空

#### 示例参数文件

该控制器的一个示例参数文件可在 test 目录中找到：

```yaml
test_state_interfaces_broadcaster:
  ros__parameters:
    interfaces: ["joint1/position", "joint2/velocity"]
```

---

## 5.9 磁力计广播器（Magnetometer Broadcaster）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/magnetometer_broadcaster/doc/userdoc.html>

用于磁力计消息（类型：`sensor_msgs/msg/MagneticField`）的广播器，使用 `semantic_components::MagneticFieldSensor`。

### 5.9.1 参数

该控制器使用 generate_parameter_library 来处理其参数。位于 src 文件夹中的参数定义文件包含控制器使用的所有参数的说明。

#### 参数列表

**`sensor_name`** (string)

定义用作其接口前缀的传感器名称。接口名称是：`<sensor_name>/magnetic_field.x, <sensor_name>/magnetic_field.y, <sensor_name>/magnetic_field.z`。

- 只读：True
- 默认值：""
- 约束：参数非空

**`frame_id`** (string)

传感器发布值所在的 frame_id。

- 只读：True
- 默认值：""
- 约束：参数非空

**`static_covariance`** (double_array)

静态协方差。关于 x、y、z 轴按行主序排列。

- 只读：True
- 默认值：{0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0}
- 约束：长度必须等于 9

#### 示例参数文件

该控制器的一个示例参数文件可在 test 目录中找到：

```yaml
test_magnetometer_broadcaster:
  ros__parameters:
    sensor_name: magnetometer
    frame_id: magnetometer_frame
```

---

## 5.10 电池状态广播器（Battery State Broadcaster）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/battery_state_broadcaster/doc/userdoc.html>

_电池状态广播器_ 以 `sensor_msgs/msg/BatteryState` 消息发布电池状态信息。

它从一个或多个电池读取与电池相关的状态接口，并以标准 ROS 2 消息格式暴露它们。这使得与监控工具、日志系统和更高级别的决策节点轻松集成。

### 5.10.1 接口

广播器可以从每个配置的电池读取以下状态接口：

- `battery_voltage` _（必需 mandatory）_ (double)
- `battery_temperature` _（可选）_ (double)
- `battery_current` _（可选）_ (double)
- `battery_charge` _（可选）_ (double)
- `battery_percentage` _（可选）_ (double)
- `battery_power_supply_status` _（可选）_ (double)
- `battery_power_supply_health` _（可选）_ (double)
- `battery_present` _（可选）_ (bool)

### 5.10.2 发布的话题

广播器发布两个话题：

- `~/raw_battery_states`（`control_msgs/msg/BatteryStateArray`）：发布 **逐电池状态消息**，包含每个配置电池的原始值；
- `~/battery_state`（`sensor_msgs/msg/BatteryState`）：发布一个 **单一聚合电池消息**，表示所有电池的综合状态。

| 字段 | `battery_state` | `raw_battery_states` |
|---|---|---|
| `header.frame_id` | 空 | 电池名称 |
| `voltage` | 所有电池的平均值 | 来自电池的 `battery_voltage` 接口 _（必需）_（未测量则为 NaN） |
| `temperature` | 报告温度电池的平均值 | 如果启用，来自电池的 `battery_temperature` 接口，否则为 nan |
| `current` | 报告电流电池的平均值 | 如果启用，来自电池的 `battery_current` 接口，否则为 nan |
| `charge` | 报告电量的电池之和 | 如果启用，来自电池的 `battery_charge` 接口，否则为 nan |
| `capacity` | 所有电池之和 | 如果提供了电池的 `capacity` 参数，否则为 nan |
| `design_capacity` | 所有电池之和 | 如果提供了电池的 `design_capacity` 参数，否则为 nan |
| `percentage` | 报告/计算百分比的电池平均值 | 如果启用，来自电池的 `battery_percentage` 接口，否则根据电池的 `minimum_voltage` 和 `maximum_voltage` 参数计算 |
| `power_supply_status` | 报告的最高枚举值 | 如果启用，来自电池的 `battery_power_supply_status` 接口，否则为 0（unknown） |
| `power_supply_health` | 报告的最高枚举值 | 如果启用，来自电池的 `battery_power_supply_health` 接口，否则为 0（unknown） |
| `power_supply_technology` | 如果所有电池相同则原样报告，否则设为 _Unknown_ | 如果提供了电池的 `power_supply_technology` 参数，否则为 0（unknown） |
| `present` | True | 如果启用，来自电池的 `battery_present` 接口，否则如果电池电压值有效（不是 NaN 也不是 0.0）则为 true |
| `cell_voltage` | 空 | 空 |
| `cell_temperature` | 空 | 空 |
| `location` | 追加所有电池位置 | 如果提供了电池的 `location` 参数，否则为空 |
| `serial_number` | 追加所有电池序列号 | 如果提供了电池的 `serial_number` 参数，否则为空 |

### 5.10.3 参数

该控制器使用 generate_parameter_library 来管理参数。参数定义文件包含完整的列表和说明。

#### 参数列表

**`batteries`** (string_array)

将从其读取电池状态接口的电池列表。

- 只读：True
- 约束：不包含重复项

**`sensor_name`** (string)

[已弃用 DEPRECATED] 电池的传感器名称。如果提供，将使用该传感器的 'voltage' 状态接口来填充 BatteryState 消息中的电压字段。如果使用此参数，则忽略 batteries 和 interfaces 参数。

- 只读：True
- 默认值：""

**`design_capacity`** (double)

[已弃用 DEPRECATED] sensor_name 模式下电池的设计容量 [Ah]（未测量则为 NaN）。

- 只读：True
- 默认值：`std::numeric_limits<double>::quiet_NaN()`

**`power_supply_technology`** (int)

[已弃用 DEPRECATED] sensor_name 模式下的电池化学类型枚举（见 <https://github.com/ros2/common_interfaces/blob/rolling/sensor_msgs/msg/BatteryState.msg>）。如果未测量，technology 设为 unknown。

- 只读：True
- 默认值：0
- 约束：参数必须在 [0, 8] 范围内

**`interfaces.<batteries>.battery_temperature`** (bool)

是否从该电池的状态接口读取电池温度 [°C]（未测量则为 NaN）。

- 只读：True
- 默认值：false

**`interfaces.<batteries>.battery_current`** (bool)

是否从该电池的状态接口读取电池电流 [A]（未测量则为 NaN）。

- 只读：True
- 默认值：false

**`interfaces.<batteries>.battery_charge`** (bool)

是否从该电池的状态接口读取电池电量 [Ah]（未测量则为 NaN）。

- 只读：True
- 默认值：false

**`interfaces.<batteries>.battery_percentage`** (bool)

是否从该电池的状态接口读取电量水平 [%]（0.0 到 100.0）。如果未测量，则使用 minimum_voltage 和 maximum_voltage 参数（如果提供）计算线性百分比，否则为 NaN。

- 只读：True
- 默认值：false

**`interfaces.<batteries>.battery_power_supply_status`** (bool)

是否从该电池的状态接口读取电源状态（例如 Charging、Full，见 <https://github.com/ros2/common_interfaces/blob/rolling/sensor_msgs/msg/BatteryState.msg>）。如果未测量，状态设为 unknown。

- 只读：True
- 默认值：false

**`interfaces.<batteries>.battery_power_supply_health`** (bool)

是否从该电池的状态接口读取电源健康状况（例如 Good、Overheat，见 <https://github.com/ros2/common_interfaces/blob/rolling/sensor_msgs/msg/BatteryState.msg>）。如果未测量，健康状况设为 unknown。

- 只读：True
- 默认值：false

**`interfaces.<batteries>.battery_present`** (bool)

是否从该电池的状态接口读取电池存在状态（如果电池存在则为 true）。如果未测量，将从电池电压值推断存在性（如果电压不是 NaN 也不是 0.0 则为 true，否则为 false）。

- 只读：True
- 默认值：false

**`<batteries>.minimum_voltage`** (double)

电池最小电压（用于计算百分比）。

- 只读：True
- 默认值：`std::numeric_limits<double>::quiet_NaN()`

**`<batteries>.maximum_voltage`** (double)

电池最大电压（用于计算百分比）。

- 只读：True
- 默认值：`std::numeric_limits<double>::quiet_NaN()`

**`<batteries>.capacity`** (double)

上次已知的电池满容量 [Ah]（未测量则为 NaN）。

- 只读：True
- 默认值：`std::numeric_limits<double>::quiet_NaN()`

**`<batteries>.design_capacity`** (double)

电池的设计容量 [Ah]（未测量则为 NaN）。

- 只读：True
- 默认值：`std::numeric_limits<double>::quiet_NaN()`

**`<batteries>.power_supply_technology`** (int)

电池化学类型枚举（见 <https://github.com/ros2/common_interfaces/blob/rolling/sensor_msgs/msg/BatteryState.msg>）。如果未测量，technology 设为 unknown。

- 只读：True
- 默认值：0
- 约束：参数必须在 [0, 8] 范围内

**`<batteries>.location`** (string)

电池的物理位置（例如插槽编号或插头标签）。

- 只读：True
- 默认值：""

**`<batteries>.serial_number`** (string)

电池的序列号。

- 只读：True
- 默认值：""

#### 示例参数文件

该控制器的一个示例参数文件可在 test 目录中找到：

```yaml
test_battery_state_broadcaster:
  ros__parameters:
    batteries:
      - "battery0"
      - "battery1"
    interfaces:
      battery0:
        battery_temperature: true
        battery_current: false
        battery_charge: true
        battery_percentage: false
        battery_power_supply_status: true
        battery_power_supply_health: true
        battery_present: false
      battery1:
        battery_temperature: true
        battery_current: true
        battery_charge: true
        battery_percentage: true
        battery_power_supply_status: true
        battery_power_supply_health: true
        battery_present: false
    battery0:
      minimum_voltage: 0.0
      maximum_voltage: 10.0
      capacity: 12000.0
      design_capacity: 13000.0
      power_supply_technology: 3
      location: "slot0"
      serial_number: "serial_device_0"
    battery1:
      minimum_voltage: 0.0
      maximum_voltage: 15.0
      capacity: 17000.0
      design_capacity: 18000.0
      power_supply_technology: 3
      location: "slot1"
      serial_number: "serial_device_1"

# [deprecated] do not use for new configurations
test_battery_state_broadcaster_legacy:
      ros__parameters:
        batteries: ["battery_state"]
        battery_state:
          design_capacity: 100.0
          power_supply_technology: 2
```

#### 面向 `ipa320/ros_battery_monitoring` 用户的迁移

如果您之前使用的是 `ipa320/ros_battery_monitoring` 包中的 `battery_state_broadcaster`，您可以直接切换到本包。使用 `sensor_name` 的配置风格仍受支持以保持向后兼容，但可能在未来的版本中被移除。

要使您的设置适应新的 `battery_state_broadcaster` 配置：

1. 将您的硬件接口名称从 `voltage` 更新为 `battery_voltage`；
2. 将您的控制器参数从

```
battery_state_broadcaster:
  ros__parameters:
    sensor_name: "battery_state"
    design_capacity: 100.0
    # https://github.com/ros2/common_interfaces/blob/rolling/sensor_msgs/msg/BatteryState.msg
    power_supply_technology: 2
```

改为：

```
battery_state_broadcaster:
  ros__parameters:
    batteries: ["battery_state"]
    battery_state:
      design_capacity: 100.0
      power_supply_technology: 2
```

**注意**：

- 参数必须提供 **sensor_name** **或** batteries 中的任意一个；
- 如果两者都为空 → 广播器将配置失败；
- 如果两者都设置 → 广播器将抛出错误。


# 6. 滤波器（Filters）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/doc/controllers_index.html>

用于状态接口滤波的可链式控制器。它们将滤波后的值作为状态接口导出，可供其他控制器或广播器使用，并且不向 ROS 话题发布。

## 6.1 链式滤波控制器（Chained Filter Controller）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/chained_filter_controller/doc/userdoc.html>

该控制器包装了 filters 包中的 `filter_chain` 库。它允许将多个滤波器链接在一起，其中一个滤波器的输出是下一个滤波器的输入。该控制器可用于对单个接口应用一系列滤波器，将相同的滤波器链应用于多个接口，或将不同的滤波器链应用于不同的接口。

### 6.1.1 参数

该控制器使用 generate_parameter_library 来处理其参数。位于 src 文件夹中的参数定义文件包含控制器使用的所有参数的说明。

完整参数列表：

**`input_interfaces`** (string_array)

输入状态接口的名称。

- 只读：True
- 默认值：{}
- 约束：参数非空

**`output_interfaces`** (string_array)

输出状态接口的名称。

- 只读：True
- 默认值：{}
- 约束：参数非空

**`filter_chain`**

定义滤波器链的参数映射，以 filterN 为键。适用于所有接口，如果设置则覆盖 `<input_interfaces>.filter_chain`。每个滤波器的字段有：type：要加载的滤波器插件；name：语义上描述滤波器的实际名称，例如 low_pass_filter；params：特定滤波器所需的底层参数映射，请参阅具体滤波器文档。

**`<input_interfaces>.filter_chain`**

除了单一配置外，还可以为每个输入接口提供不同的配置。键是输入接口的名称，值是定义滤波器链的参数映射，以 filterN 为键。每个滤波器的字段有：type：要加载的滤波器插件；name：语义上描述滤波器的实际名称，例如 low_pass_filter；params：特定滤波器所需的底层参数映射，请参阅具体滤波器文档。

该控制器的一个示例参数文件（单接口）可在 test 目录中找到：

```yaml
test_chained_filter:
  ros__parameters:
    filter_chain:
      filter1:
        name: filter1
        type: "filters/MeanFilterDouble"
        params:
          number_of_observations: 2
    input_interfaces: ["wheel_left/position"]
    output_interfaces: ["wheel_left/filtered_position"]
```

或多接口：

```yaml
test_chained_filter_multiple_interfaces:
  ros__parameters:
    filter_chain:
      filter1:
        name: position_filter
        type: "filters/MeanFilterDouble"
        params:
          number_of_observations: 2
    input_interfaces:
      - "wheel_left/position"
      - "wheel_right/position"
    output_interfaces:
      - "wheel_left/filtered_position"
      - "wheel_right/filtered_position"

test_chained_filter_multiple_interfaces_config_per_input:
  ros__parameters:
    input_interfaces:
      - "wheel_left/position"
      - "wheel_right/position"
    output_interfaces:
      - "wheel_left/filtered_position"
      - "wheel_right/filtered_position"
    wheel_left/position:
      filter_chain:
        filter1:
          name: wheel_left_filter
          type: "filters/MeanFilterDouble"
          params:
            number_of_observations: 2
    wheel_right/position:
      filter_chain:
        filter1:
          name: wheel_right_filter
          type: "filters/MeanFilterDouble"
          params:
            number_of_observations: 3
```

---



---

# 7. 公共控制器参数（Common Controller Parameters）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/doc/controllers_index.html>

每个控制器和广播器都有一些公共参数。它们是可选的，但如果需要，必须在 `onConfigure` 转换到 `inactive` 状态之前设置，参见生命周期文档。一旦控制器已加载，此转换通过 controller_manager 的 `configure_controller` 服务完成。

- `update_rate`：一个无符号整数参数，表示每个控制器/广播器运行其更新周期的速率。当未指定时，它们以与 controller_manager 相同的频率运行。
- `is_async`：一个布尔参数，用于指定控制器更新是否需要异步运行。


## 附录：本中文文档覆盖范围说明

本中文文档对 ros2_controllers 官方文档（jazzy 版）中全部 37 个技术页面进行了全文翻译，覆盖范围如下：

**指南类（2 页）**
- 轮式移动机器人运动学（Wheeled Mobile Robot Kinematics）
- 编写新控制器指南（Writing a New Controller）

**移动机器人运动控制器（7 页）**
- 差速驱动控制器（diff_drive_controller）
- 麦克纳姆轮驱动控制器（mecanum_drive_controller）
- 全向轮驱动控制器（omni_wheel_drive_controller）
- 转向控制器库（steering_controllers_library，含 bicycle/tricycle/ackermann_steering 三个子页）
- 三轮车控制器（tricycle_controller）

**通用/工业控制器（8 页）**
- 导纳控制器（admittance_controller）
- 力控制器（effort_controllers）
- 前馈命令控制器（forward_command_controller）
- 夹爪控制器（gripper_controllers）
- GPIO 控制器（gpio_controllers）
- 平行夹爪动作控制器（parallel_gripper_controller）
- PID 控制器（pid_controller）
- 位置控制器（position_controllers）/ 速度控制器（velocity_controllers）
- 运动原语控制器（motion_primitives_controllers）

**关节轨迹控制器系列（6 页）**
- joint_trajectory_controller 主文档、轨迹表示、轨迹替换、取消时减速、速度缩放、参数详情、rqt_joint_trajectory_controller

**传感器/状态广播器（10 页）**
- force_torque_sensor_broadcaster（含力/力矩变换节点）、imu_sensor_broadcaster、joint_state_broadcaster、range_sensor_broadcaster、pose_broadcaster、gps_sensor_broadcaster、state_interfaces_broadcaster、magnetometer_broadcaster、battery_state_broadcaster、chained_filter_controller

翻译约定：
- 正文译为中文；代码、YAML 示例、命令、参数名、ROS 标识符、消息/接口类型、公式保留原文；
- 专业术语首次出现时标注英文原文；
- 每个章节顶部附原文档链接，便于对照查阅。

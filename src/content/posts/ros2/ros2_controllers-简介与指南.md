---
title: "ros2_controllers 官方文档（一）：简介、指南与最佳实践"
published: 2026-08-31
description: "ros2_controllers 中文翻译：文档结构总览、轮式移动机器人运动学、编写新控制器的指南与最佳实践。"
image: ""
tags: ["ROS2", "机器人", "ros2_control", "翻译"]
category: ROS2专题
slug: ros2-controllers-intro-and-guidelines
series: "ROS2-Control 官方文档中文翻译"
seriesOrder: 5
draft: false
lang: "zh-CN"
---

> **原文地址**：<https://control.ros.org/jazzy/doc/ros2_controllers/doc/controllers_index.html>
> **原文版本**：ROS 2 Jazzy（较旧但仍受支持的版本，最新版见 Kilted）
> **翻译说明**：本文为《ros2_controllers 官方文档（Jazzy 版）中文翻译》系列分篇，覆盖「简介与文档结构、指南与最佳实践」。正文与说明文字译为中文；代码、命令、参数名、消息类型、ROS 标识符、数学公式保留原文；关键术语在首次出现时标注英文原文。
> **原文档仓库**：<https://github.com/ros-controls/ros2_controllers>

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


- $x_b,y_b$ 是机器人机体坐标系，位于轮子与地面的接触点。
- $x_w,y_w$ 是世界坐标系。
- $v_{b,x}$ 是机器人在 x 轴上的线速度。
- $v_{b,y}$ 是机器人在 y 轴上的线速度。
- $\omega_{b,z}$ 是机器人在 z 轴上的角速度。
- $R$ 是机器人的半径 / 机器人中心到轮子的距离。
- 轮子 $i$ 上的红色箭头表示其旋转的正方向 $\omega_i$。
- $\gamma$ 是第一个轮子相对 $x_b$ 的角度偏移。
- $\theta$ 是每个轮子之间的角度，可用下式计算，其中 $n$ 是轮子数量。

$$
\theta = \frac{2\pi}{n}
$$

**逆运动学（Inverse Kinematics）**

为实现期望的机体速度旋量（body twist），所需的轮子角速度可用以下矩阵计算：

$$
\begin{split}A = \begin{bmatrix} \sin(\gamma) & -\cos(\gamma) & -R \\ \sin(\theta + \gamma) & -\cos(\theta + \gamma) & -R\\ \sin(2\theta + \gamma) & -\cos(2\theta + \gamma) & -R\\ \sin(3\theta + \gamma) & -\cos(3\theta + \gamma) & -R\\ \vdots & \vdots & \vdots\\ \sin((n-1)\theta + \gamma) & -\cos((n-1)\theta + \gamma) & -R\\ \end{bmatrix}\end{split}
$$

$$
\begin{split}\begin{bmatrix} \omega_1\\ \omega_2\\ \omega_3\\ \omega_4\\ \vdots\\ \omega_n \end{bmatrix} = \frac{1}{r} A \begin{bmatrix} v_{b,x}\\ v_{b,y}\\ \omega_{b,z}\\ \end{bmatrix}\end{split}
$$

这里 $\omega_1,\ldots,\omega_n$ 是轮子的角速度，$r$ 是轮子的半径。这些方程可以对任意轮子 $i$ 写成如下代数形式：

$$
\omega_i = \frac{\sin((i-1)\theta + \gamma) v_{b,x} - \cos((i-1)\theta + \gamma) v_{b,y} - R \omega_{b,z}}{r}
$$

**正运动学（Forward Kinematics）**

机器人的机体速度旋量可由轮速通过矩阵 $A$ 的伪逆获得：

$$
\begin{split}\begin{bmatrix} v_{b,x}\\ v_{b,y}\\ \omega_{b,z}\\ \end{bmatrix} = rA^\dagger \begin{bmatrix} \omega_1\\ \omega_2\\ \omega_3\\ \omega_4\\ \vdots\\ \omega_n \end{bmatrix}\end{split}
$$

#### 滑移转向驱动机器人（Swerve Drive Robots）

下面解释使用四个滑移模块（每个模块具有独立控制的转向电机和驱动电机）的全向驱动机器人的运动学。它遵循 REP-103 定义的坐标约定。
![Swerve 滑移转向驱动机器人](https://lux2026.oss-cn-hangzhou.aliyuncs.com/images/ros2_controllers/kinematics/swerve_drive.svg)


- $x_b, y_b$ 是机器人机体坐标系，位于机器人的几何中心。
- $x_w, y_w$ 是世界坐标系。
- $v_{b,x}$ 是机器人在 x 轴上的线速度。
- $v_{b,y}$ 是机器人在 y 轴上的线速度。
- $\omega_{b,z}$ 是机器人在 z 轴上的角速度。
- $l$ 是轴距（wheelbase，前后轮之间的距离）。
- $w$ 是轮距（track width，左右轮之间的距离）。
- 轮子 $i$ 上的红色箭头表示该轮速度 $v_i$ 的方向。

每个滑移模块 $i$（$i = 0, 1, 2, 3$，通常为左前、右前、左后、右后）位于相对中心的 $(l_{i,x}, l_{i,y})$ 处，典型位置为：

- 左前：$(l/2, w/2)$
- 右前：$(l/2, -w/2)$
- 左后：$(-l/2, w/2)$
- 右后：$(-l/2, -w/2)$

**逆运动学**

对位于 $(l_{i,x}, l_{i,y})$ 的每个模块 $i$，其速度矢量为：

$$
\begin{split}\begin{bmatrix} v_{i,x} \\ v_{i,y} \end{bmatrix} = \begin{bmatrix} v_{b,x} - \omega_{b,z} l_{i,y} \\ v_{b,y} + \omega_{b,z} l_{i,x} \end{bmatrix}\end{split}
$$

轮速 $v_i$ 和转向角 $\phi_i$ 为：

$$
v_i = \sqrt{v_{i,x}^2 + v_{i,y}^2}
$$

$$
\phi_i = \arctan2(v_{i,y}, v_{i,x})
$$

**里程计**

机器人的机体速度旋量由轮速 $v_i$ 和转向角 $\phi_i$ 计算得到。每个模块在机体坐标系中的速度分量为：

$$
v_{i,x} = v_i \cos(\phi_i), \quad v_{i,y} = v_i \sin(\phi_i)
$$

底盘速度计算如下：

$$
v_{b,x} = \frac{1}{4} \sum_{i=0}^{3} v_{i,x}, \quad v_{b,y} = \frac{1}{4} \sum_{i=0}^{3} v_{i,y}
$$

$$
\omega_{b,z} = \frac{\sum_{i=0}^{3} (v_{i,y} l_{i,x} - v_{i,x} l_{i,y})}{\sum_{i=0}^{3} (l_{i,x}^2 + l_{i,y}^2)}
$$

里程计使用计算出的底盘速度在全局坐标系中更新机器人的位姿（$x$、$y$、$\theta$）。全局速度为：

$$
v_{x,\text{global}} = v_{b,x} \cos(\theta) - v_{b,y} \sin(\theta)
$$

$$
v_{y,\text{global}} = v_{b,x} \sin(\theta) + v_{b,y} \cos(\theta)
$$

### 2.1.2 非完整约束轮式移动机器人

#### 单轮模型（Unicycle model）

为定义坐标系（ROS 坐标帧约定，坐标系遵循右手定则），考虑如下简单的单轮模型：
![单轮模型](https://lux2026.oss-cn-hangzhou.aliyuncs.com/images/ros2_controllers/kinematics/unicycle.svg)


- $x_b,y_b$ 是机器人机体坐标系，位于轮子与地面的接触点。
- $x_w,y_w$ 是世界坐标系。
- $x,y$ 是机器人在世界坐标系中的笛卡尔坐标。
- $\theta$ 是机器人的航向角，即机器人 $x_b$ 轴相对世界 $x_w$ 轴的方向。

接下来，我们希望以期望的机体速度旋量来命令机器人：

$$
\begin{split}\vec{\nu}_b = \begin{bmatrix} \vec{\omega}_{b} \\ \vec{v}_{b} \end{bmatrix},\end{split}
$$

其中 $\vec{v}_{b}$ 是机器人在其机体坐标系中的线速度，$\vec\omega_{b}$ 是机器人在其机体坐标系中的角速度。由于我们考虑在平坦表面上转向的机器人，给出以下输入即可：

- $v_{b,x}$，即机器人沿 $x_b$ 轴方向的线速度。
- $\omega_{b,z}$，即机器人绕 $x_z$ 轴的角速度。

作为期望的系统输入。单轮模型的正运动学可计算如下：

$$
\begin{split}\dot{x} &= v_{b,x} \cos(\theta) \\ \dot{y} &= v_{b,x} \sin(\theta) \\ \dot{\theta} &= \omega_{b,z}\end{split}
$$

我们将建立逆运动学，以根据给定的机体速度旋量计算机器人的期望命令（轮速或转向角）。

#### 差速驱动机器人（Differential Drive Robot）

引用 Siciliano 等的 *Robotics: Modelling, Planning and Control*：

> 严格意义上的单轮车（即装备单个轮子的车辆）在静态条件下存在严重的平衡问题。然而，存在一些在运动学上等价于单轮车、但在力学上更稳定的车辆。

其中一种车辆就是差速驱动机器人，它有两个轮子，每个轮子独立驱动。
![差速驱动机器人](https://lux2026.oss-cn-hangzhou.aliyuncs.com/images/ros2_controllers/kinematics/diff_drive.svg)


- $w$ 是轮距（wheel track，两轮之间的距离）。

**正运动学**

差速驱动模型的正运动学可由上面的单轮模型计算：

$$
\begin{split}v_{b,x} &= \frac{v_{right} + v_{left}}{2} \\ \omega_{b,z} &= \frac{v_{right} - v_{left}}{w}\end{split}
$$

**逆运动学**

实现期望机体速度旋量所需的轮速可计算如下：

$$
\begin{split}v_{left} &= v_{b,x} - \omega_{b,z} w / 2 \\ v_{right} &= v_{b,x} + \omega_{b,z} w / 2\end{split}
$$

**里程计**

我们可以使用上面的正运动学方程直接从编码器读数计算机器人的里程计。

#### 类车（自行车）模型（Car-Like (Bicycle) Model）

下图展示了一个两轮的类车机器人，其前轮可转向。该模型也称为自行车模型。
![类车（自行车）模型](https://lux2026.oss-cn-hangzhou.aliyuncs.com/images/ros2_controllers/kinematics/car_like_robot.svg)


- $\phi$ 是前轮的转向角，绕 $x_z$ 轴旋转的方向为正。
- $v_{rear}, v_{front}$ 是后轮和前轮的速度。
- $l$ 是轴距（wheelbase）。

我们假设轮子无滑动地滚动。这意味着轮子与地面接触点的速度为零，轮子的速度方向垂直于轮轴方向。**瞬时旋转中心**（Instantaneous Center of Rotation, ICR），即机器人绕其旋转的圆心，位于垂直于各轮轴且通过轮子与地面接触点的直线的交点处。

由于无滑动条件，两个轮子的速度必须满足如下约束：

$$
v_{rear} = v_{front} \cos(\phi)
$$

**正运动学**

类车模型的正运动学可计算如下：

$$
\begin{split}\dot{x} &= v_{b,x} \cos(\theta) \\ \dot{y} &= v_{b,x} \sin(\theta) \\ \dot{\theta} &= \frac{v_{b,x}}{l} \tan(\phi)\end{split}
$$

**逆运动学**

转向角是机器人的一个命令输入：

$$
\phi = \arctan\left(\frac{l w_{b,z}}{v_{b,x}} \right)
$$

对于后轮驱动，后轮速度是机器人的第二个输入：

$$
v_{rear} = v_{b,x}
$$

对于前轮驱动，前轮速度是机器人的第二个输入：

$$
v_{front} = \frac{v_{b,x}}{\cos(\phi)}
$$

**里程计**

我们必须区分两种情况：编码器在后轮或在前轮。

对于后轮的情况：

$$
\begin{split}\dot{x} &= v_{rear} \cos(\theta) \\ \dot{y} &= v_{rear} \sin(\theta) \\ \dot{\theta} &= \frac{v_{rear}}{l} \tan(\phi)\end{split}
$$

对于前轮的情况：

$$
\begin{split}\dot{x} &= v_{front} \cos(\theta) \cos(\phi)\\ \dot{y} &= v_{front} \sin(\theta) \cos(\phi)\\ \dot{\theta} &= \frac{v_{front}}{l} \sin(\phi)\end{split}
$$

#### 双牵引轴（Double-Traction Axle）

下图展示了一个三轮的类车机器人，后部有两个独立的牵引轮。
![双牵引轴模型](https://lux2026.oss-cn-hangzhou.aliyuncs.com/images/ros2_controllers/kinematics/double_traction.svg)


- $w_r$ 是后轴的轮距。

**正运动学**

正运动学与上面的类车模型相同。

**逆运动学**

机器人的转弯半径为：

$$
R_b = \frac{l}{\tan(\phi)}
$$

为避免打滑，后轮速度必须满足以下条件：

$$
\begin{split}v_{rear,left} &= v_{b,x}\frac{R_b - w_r/2}{R_b}\\ v_{rear,right} &= v_{b,x}\frac{R_b + w_r/2}{R_b}\end{split}
$$

**里程计**

由牵引轴的两个编码器测量值计算 $v_{b,x}$ 是超定（overdetermined）的。如果无滑动且编码器理想，则：

$$
v_{b,x} = v_{rear,left} \frac{R_b}{R_b - w_r/2} = v_{rear,right} \frac{R_b}{R_b + w_r/2}
$$

成立。但为得到更鲁棒的解，我们取两者的平均值，即：

$$
v_{b,x} = 0.5 \left(v_{rear,left} \frac{R_b}{R_b - w_r/2} + v_{rear,right} \frac{R_b}{R_b + w_r/2}\right).
$$

#### 阿克曼转向（Ackermann Steering）

下图展示了一个四轮机器人，前部有两个独立转向轮。
![阿克曼转向模型](https://lux2026.oss-cn-hangzhou.aliyuncs.com/images/ros2_controllers/kinematics/ackermann_steering.svg)


- $w_f$ 是前轴的轮距，在两个主销（kingpin）之间测量。

为防止前轮打滑，前轮的转向角不能相等。这就是所谓的**阿克曼转向（Ackermann steering）**。

> **注意**
>
> 阿克曼转向也可以通过两个前轮之间的机械连杆实现。在这种情况下，机器人只有一个转向输入，两个前轮的转向角机械耦合。此时机器人的逆运动学与上面的类车模型相同。

**正运动学**

正运动学与上面的类车模型相同。

**逆运动学**

机器人的转弯半径为：

$$
R_b = \frac{l}{\tan(\phi)}
$$

为避免打滑，前轮转向角必须满足以下条件：

$$
\begin{split}\phi_{left} &= \arctan\left(\frac{l}{R_b - w_f/2}\right) = \arctan\left(\frac{2l\sin(\phi)}{2l\cos(\phi) - w_f\sin(\phi)}\right)\\ \phi_{right} &= \arctan\left(\frac{l}{R_b + w_f/2}\right) = \arctan\left(\frac{2l\sin(\phi)}{2l\cos(\phi) + w_f\sin(\phi)}\right)\end{split}
$$

**里程计**

由转向轴的两个角度测量值计算 $\phi$ 是超定的。如果无滑动且测量理想，则：

$$
\phi = \arctan\left(\frac{l\tan(\phi_{left})}{l + w_f/2 \tan(\phi_{left})}\right) = \arctan\left(\frac{l\tan(\phi_{right})}{l - w_f/2 \tan(\phi_{right})}\right)
$$

成立。但为得到更鲁棒的解，我们取两者的平均值，即：

$$
\phi = 0.5 \left(\arctan\left(\frac{l\tan(\phi_{left})}{l + w_f/2 \tan(\phi_{left})}\right) + \arctan\left(\frac{l\tan(\phi_{right})}{l - w_f/2 \tan(\phi_{right})}\right)\right).
$$

#### 带牵引的阿克曼转向（Ackermann Steering with Traction）

下图展示了一个四轮的类车机器人，前部有两个独立转向轮，同时这两个轮也独立驱动。
![带牵引的阿克曼转向模型](https://lux2026.oss-cn-hangzhou.aliyuncs.com/images/ros2_controllers/kinematics/ackermann_steering_traction.svg)


- $d_{kp}$ 是主销到前轮与地面接触点的距离。

**正运动学**

正运动学与上面的类车模型相同。

**逆运动学**

为避免前轮打滑，前轮的速度不能相等，且：

$$
\frac{v_{front,left}}{R_{left}} = \frac{v_{front,right}}{R_{right}} = \frac{v_{b,x}}{R_b}
$$

其中机器人与左/右前轮的转弯半径为：

$$
\begin{split}R_b &= \frac{l}{\tan(\phi)} \\ R_{left} &= \frac{l-d_{kp}\sin(\phi_{left})}{\sin(\phi_{left})}\\ R_{right} &= \frac{l+d_{kp}\sin(\phi_{right})}{\sin(\phi_{right})}.\end{split}
$$

这得到如下逆运动学方程：

$$
\begin{split}v_{front,left} &= \frac{v_{b,x}(l-d_{kp}\sin(\phi_{left}))}{R_b\sin(\phi_{left})}\\ v_{front,right} &= \frac{v_{b,x}(l+d_{kp}\sin(\phi_{right}))}{R_b\sin(\phi_{right})}\end{split}
$$

其中前轮转向角来自上面的阿克曼转向方程。

**里程计**

由牵引轴的两个编码器测量值计算 $v_{b,x}$ 同样是超定的。如果无滑动且编码器理想，则：

$$
v_{b,x} = v_{front,left} \frac{R_b\sin(\phi_{left})}{l-d_{kp}\sin(\phi_{left})} = v_{front,right} \frac{R_b\sin(\phi_{right})}{l+d_{kp}\sin(\phi_{right})}
$$

成立。但为得到更鲁棒的解，我们取两者的平均值，即：

$$
v_{b,x} = 0.5 \left( v_{front,left} \frac{R_b\sin(\phi_{left})}{l-d_{kp}\sin(\phi_{left})} + v_{front,right} \frac{R_b\sin(\phi_{right})}{l+d_{kp}\sin(\phi_{right})}\right).
$$

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

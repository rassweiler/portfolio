---
date: 2022-08-25T10:58:08-04:00
title: "Godot First Person Controller (Rigidbody)"
description: "FPCC using a RigidDynamicBody3D..."
hero: "images/fpcc-bg.webp"
tags: ["Software", "Godot","Character","Controller","First Person"]
categories: ["Software","Game-Dev"]
---

A simple rigidbody based first person controller.

<!--more-->

___

## Scene Stack

```toml
[gd_scene load_steps=5 format=3 uid="uid://dtwbwpgj5l554"]

[ext_resource type="Script" path="res://Characters/first_person_camera_rigidbody/first_person_camera_rigid.gd" id="1_c5av4"]

[sub_resource type="PhysicsMaterial" id="PhysicsMaterial_to0ij"]
resource_local_to_scene = true
rough = true

[sub_resource type="CapsuleMesh" id="CapsuleMesh_yj4ak"]

[sub_resource type="ConvexPolygonShape3D" id="ConvexPolygonShape3D_k2gcp"]
points = PackedVector3Array(-0.125207, -0.532801, -0.480507, 0.0227831, 0.47607, 0.498884, 0.169713, 0.559144, 0.464172, 0.231051, -0.803591, 0.320455, 0.40741, 0.651043, -0.243523, -0.482789, 0.594843, 0.0822132, -0.362868, -0.682312, 0.289697, 0.469044, -0.654529, -0.0662713, -0.127444, 0.842701, -0.338103, -0.393435, -0.683942, -0.244717, 0.438255, 0.623309, 0.200849, 0.0841477, 0.977454, 0.114795, -0.0682023, -0.976458, -0.12927, 0.20055, -0.563129, -0.451454, -0.185527, 0.595453, -0.453475, -0.273363, 0.592268, 0.407754, -0.00693649, -0.476823, 0.49966, 0.375821, -0.588614, 0.316955, 0.111579, 0.563059, -0.481177, -0.41725, 0.527866, -0.270497, -0.484546, -0.596972, -0.0665097, -0.279747, 0.908561, 0.0533361, -0.250197, -0.880712, 0.205319, 0.263647, -0.902771, -0.127394, 0.293368, 0.871526, -0.157196, 0.373412, -0.526319, -0.328246, 0.499663, 0.476641, -0.00688856, 0.0531056, 0.875001, 0.324703, -0.154543, -0.590854, 0.465879, -0.0972799, -0.782358, -0.398188, -0.387649, -0.498171, 0.31565, -0.30068, -0.587995, -0.388901)

[node name="first_person_camera_rigid" type="RigidDynamicBody3D"]
axis_lock_angular_x = true
axis_lock_angular_y = true
axis_lock_angular_z = true
physics_material_override = SubResource("PhysicsMaterial_to0ij")
continuous_cd = true
contacts_reported = 1
contact_monitor = true
freeze_mode = 1
script = ExtResource("1_c5av4")

[node name="MeshInstance3D" type="MeshInstance3D" parent="."]
mesh = SubResource("CapsuleMesh_yj4ak")

[node name="CollisionShape" type="CollisionShape3D" parent="."]
shape = SubResource("ConvexPolygonShape3D_k2gcp")

[node name="Neck" type="Node3D" parent="."]
transform = Transform3D(1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0.623569, 0)

[node name="Camera3D" type="Camera3D" parent="Neck"]

[node name="Feet" type="RayCast3D" parent="."]
transform = Transform3D(1, 0, 0, 0, 1, 0, 0, 0, 1, 0, -0.957716, 0)
target_position = Vector3(0, -0.2, 0)
collision_mask = 4095
collide_with_areas = true

```

## Scene Script

```python
extends RigidDynamicBody3D

@export var acceleration = 15.0
@export var deceleration = 1.0
@export var jump_velocity = 5.0
@export var speed = 15.0
@export var max_speed = 15.0
@export var view_sensitivity = 10.0
@export_range(0.01,1.0) var stop_speed = 0.1

# Get the gravity from the project settings to be synced with RigidDynamicBody nodes.
var gravity = ProjectSettings.get_setting("physics/3d/default_gravity")
var velocity = Vector3()
var mouse_input = Vector2()
var is_on_floor = false
var move_input = Vector2()

@onready var neck := $Neck
@onready var camera := $Neck/Camera3D
@onready var feet := $Feet
@onready var body := $CollisionShape

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseButton:
		Input.set_mouse_mode(Input.MOUSE_MODE_CAPTURED)
		
	elif event.is_action_pressed("ui_cancel"):
		Input.set_mouse_mode(Input.MOUSE_MODE_VISIBLE)
		
	if Input.get_mouse_mode() == Input.MOUSE_MODE_CAPTURED:
		if event is InputEventMouseMotion:
			neck.rotate_y(-event.relative.x * 0.01)
			camera.rotate_x(-event.relative.y * 0.01)
			camera.rotation.x = clamp(camera.rotation.x, deg2rad(-50), deg2rad(80))
			mouse_input = event.relative
			
func _ready():
	linear_damp = 1.0
	
func _integrate_forces(state):
	if state.linear_velocity.length() > max_speed:
		state.linear_velocity = state.linear_velocity.normalized() * max_speed
		
	if move_input.length() < 0.2:
		state.linear_velocity.x = lerp(state.linear_velocity.x, 0.0, stop_speed)
		state.linear_velocity.z = lerp(state.linear_velocity.z, 0.0, stop_speed)
		
	if state.get_contact_count() > 0 and move_input.length() < 0.2:
		if is_on_floor and state.get_contact_local_normal(0).y < 0.9:
			apply_central_force(-state.get_contact_local_normal(0) * 10)

func _physics_process(delta):
	if physics_material_override.friction >= 0:
		physics_material_override.friction = 0
	move_input = Vector2.ZERO
	var direction = Vector3()
	move_input = Input.get_vector("move_left", "move_right", "move_forward", "move_back")
	direction = (neck.transform.basis * Vector3(move_input.x, 0, move_input.y)).normalized()
	velocity = lerp(velocity, direction * speed, acceleration * deceleration * delta)
	apply_central_force(velocity)
	
	if feet.is_colliding():
		is_on_floor = true
		deceleration = 1.0
		physics_material_override.friction = 1
		
	if Input.is_action_just_pressed("jump") and is_on_floor:
		deceleration = 0.1
		is_on_floor = false
		apply_central_impulse(Vector3.UP * jump_velocity)

```

___
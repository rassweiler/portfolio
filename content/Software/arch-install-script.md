---
date: 2021-11-20T10:58:08-04:00
title: "Arch Snapper BTRFS Install Guide - Script Method"
description: "Easy Install Guide For Arch Linux Using BTRFS"
featured_image: "/images/archinstall-bg.png"
tags: ["OS","Arch","Linux","BTRFS","Snapper"]
---

This guide is for installing arch linux (UEFI) using a script with:
- BTRFS file system including subvolumes.
- Snapper.
- Snap-pac-grub.
- Bootable snapshots.
- Qemu/kvm with iommu setup.
- Linux/Windows Gaming.

<!--more-->

___

## Manual Install Guide:
[Arch Manual Install](https://www.kylerassweiler.ca/arch-install/)

## Install ISO to USB:

After downloading the latest [Arch ISO](https://archlinux.org/download/) you will need to install it to a usb using a program like [Balena Etcher](https://github.com/balena-io/etcher). Plug the usb into the machine you want to install arch to and boot into the usb.

___

## Base Install

### Give root a password then get the local ip:

```zsh
passwd

ip address show
```

### SSH into the target machine from your main:

```zsh
ssh root@xxx.xxx.xxx.xxx
```

### Find your device:

Use lsblk to dyplay your disk information, normally the drive will listed as SDA or SDB.

```zsh
lsblk

gdisk /dev/XXX
```

Replace XXX with the target device.

### Create Boot Partition:

Use the n command to create a new partition on the disk, use the default partition number, use the default first sector, offset the last sector by 512M, and give it a efi flag of ef00.

```zsh
n

default

default

+512M

ef00
```

### Create Swap Partition (Optional):

Creating a swap partion is optional, if this step is skipped adjust the partion numbers in the future commands.

Use the n command to create a new partition on the disk, use the default partition number, use the default first sector, offset the last sector by 2G, and give it a linux-swap flag of 8200.

```zsh
n

default

default

+2G

8200
```

### Create Main Partition And Write Changes:

Use the n command to create a new partition on the disk, use the default partition number, use the default first sector, since we are using the remainder of the disk we can use the default last sector, and use the default flag for linux filesystem.

```zsh
n

default

default

default

w

y
```

### Run Pre-chroot Script:

Download and run the arch setup scripts:

Make sure to edit scrip and select between intel or amd!

```zsh
cd /tmp

curl https://raw.githubusercontent.com/rassweiler/linux-install-scripts/master/arch/initial-pre-chroot.sh > install.sh

chmod +x install.sh

nano ./install.sh

./install.sh
```

Enter drive info. Ex: /dev/vda1

### Run Post-chroot Script:

download and run the arch setup scripts:

Make sure to edit script and select between intel or amd!

Make sure to edit script and set timezone!

```zsh
cd /tmp

git clone https://github.com/rassweiler/linux-install-scripts.git

chmod +x -R linux-install-scripts/

cd linux-install-scripts/arch/

nano initial-post-chroot.sh

./initial-post-chroot.sh
```

Add items to mkinitcpio:

```yml
MODULES=(vfio_pci vfio vfio_iommu_type1 vfio_virqfd btrfs)
```

Add items to grub file if needed:

```yml
GRUB_CMDLINE_LINUX_DEFAULT="quiet intel_iommu=on loglevel=3 nowatchdog"
```

### Finish Setup And Reboot:

```zsh
exit

umount -a

reboot
```

### SSH Into Machine As New User:

```zsh
ssh NAME@xxx.xxx.xxx.xxx
```

___

## Use Install Scripts:

Make sure to edit script.

```zsh
cd /tmp

git clone https://github.com/rassweiler/linux-install-scripts.git

chmod +x -R linux-install-scripts/

cd linux-install-scripts/arch/

nano xorg.sh

./i3wm.sh
```

Run script for desired DE

```zsh
./i3wm.sh
```

Make the following changes based on preference, and make sure to add the new user to the allowed list.

```yml
ALLOW_USERS="NAME"
TIMELINE_LIMIT_HOURLY="5"
TIMELINE_LIMIT_DAILY="7"
TIMELINE_LIMIT_WEEKLY="0"
TIMELINE_LIMIT_MONTHLY="0"
TIMELINE_LIMIT_YEARLY="0"
```

Add the proper card to the end of the modules and rebuild

- Amd: `amdgpu`

- Nvidia: `nvidia`

```yml
# MODULES
# The following modules are loaded before any boot hooks are
# run.  Advanced users may wish to specify all system modules
# in this array.  For instance:
MODULES=(vfio_pci vfio vfio_iommu_type1 vfio_virqfd btrfs nvidia)
```

Once script is completed skip down to section `Setup VM`.

___

## Tuning:

### A - Pulse Audio:

```zsh
sudo nano /etc/pulse/daemon.conf
```

Change settings

```yml
high-priority = yes
nice-level = -11

realtime-scheduling = yes
realtime-priority = 5
```

## Setup VM

### Verify Iommu:

This command should present a line with `DMAR: IOMMU enabled`

```zsh
sudo dmesg | grep -i -e DMAR -e IOMMU
```

If iommu is enabled then paste in this command to view the groups and make sure devices to be passed over are in seperate groups:

```zsh
shopt -s nullglob
for g in `find /sys/kernel/iommu_groups/* -maxdepth 0 -type d | sort -V`; do
	echo "IOMMU Group ${g##*/}:"
	for d in $g/devices/*; do
		echo -e "\t$(lspci -nns ${d##*/})"
	done;
done;
```

Note down the ids for the devices to be passed through:

```yml
[1022:43e9]
```

## REFERENCES

- [Arch Install Guide](https://wiki.archlinux.org/title/Installation_guide)
- [Arch PCI Passthrough](https://wiki.archlinux.org/title/PCI_passthrough_via_OVMF)
- [SomeOrdinaryGamer](https://www.youtube.com/watch?v=h7SG7ccjn-g)
- [EF - Linux Made Simple](https://www.youtube.com/watch?v=o09jzArQcFQ)
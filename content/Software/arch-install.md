---
date: 2021-11-20T10:58:08-04:00
title: "Arch Snapper BTRFS Install Guide"
description: "Easy Install Guide For Arch Linux Using BTRFS"
featured_image: "/images/archinstall-bg.png"
tags: ["OS","Arch","Linux","BTRFS","Snapper"]
---

This guide is for installing arch linux (UEFI) with:
- BTRFS file system including subvolumes.
- Snapper.
- Snap-pac-grub.
- Bootable snapshots.
- Qemu/kvm with iommu setup.
- Linux/Windows Gaming.

<!--more-->

___

## Script Install Guide:
[Arch Script Install](https://www.kylerassweiler.ca/arch-install-script/)

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

### Setup Partition Filesystems And Subvolumes:

If you skipped the swap partition then skip the mkswap and swapon and use the right partition number for the btrfs volume.

```zsh
mkfs.vfat /dev/vda1 #Can also use mkfs.fat -F32 /dev/xxxx

mkswap /dev/vda2

swapon /dev/vda2

mkfs.btrfs /dev/vda3

mount /dev/vda3 /mnt

btrfs su cr /mnt/@

btrfs su cr /mnt/@home

btrfs su cr /mnt/@snapshots

btrfs su cr /mnt/@var_log
```

### Remount Partitions Individually:

In order to setup the systems fstab we need to remount the partitions individually with the proper settings. 

Use lsblk to verify all partitions and volumes were mounted.

```zsh
umount /mnt

mount -o noatime,compress=lzo,space_cache=v2,subvol=@ /dev/vda3 /mnt

mkdir -p /mnt/{boot,home,.snapshots,var/log}

mount -o noatime,compress=lzo,space_cache=v2,subvol=@home /dev/vda3 /mnt/home

mount -o noatime,compress=lzo,space_cache=v2,subvol=@snapshots /dev/vda3 /mnt/.snapshots

mount -o noatime,compress=lzo,space_cache=v2,subvol=@var_log /dev/vda3 /mnt/var/log

mount /dev/vda1 /mnt/boot

lsblk
```

### Update the timezone:

```zsh
timedatectl set-ntp true
```

### Update the mirrors:

```zsh
reflector -c Canada -c US -a 6 --sort rate --save /etc/pacman.d/mirrorlist

pacman -Syy
```

### Add desired packages (May have error about missing file fsck.btrfs):

Choose your base: `linux, linux-lts, linux-zen`.

Choose your ucode: `intel-ucode, amd-ucode`.

```zsh
pacstrap /mnt base base-devel linux-zen linux-zen-headers linux-firmware nano intel-ucode cifs-utils reflector sudo git rsync
```

### Generate fstab:

```zsh
genfstab -U /mnt >> /mnt/etc/fstab
```

### Enter system:

```zsh
arch-chroot /mnt
```

### Setup System Time:

```zsh
timedatectl list-timezones | grep Toronto

ln -sf /usr/share/zoneinfo/America/Toronto /etc/localtime

hwclock --systohc
```

### Setup Locale Generator:

```zsh
nano /etc/locale.gen
```

Uncomment your desired locales

```yml
en_CA.UTF-8
```

### Generate Locale:

```zsh
locale-gen
```

### Update Keymap:

```zsh
nano /etc/vconsole.conf
```

```yml
KEYMAP=us
```

### Update Mirrors:

```zsh
reflector -c Canada -c US -a 6 --sort rate --save /etc/pacman.d/mirrorlist

pacman -Syy
```

### Create Locale Config:

```zsh
nano /etc/locale.conf
```

Insert you chosen language from step 16

```yml
LANG=en_CA.UTF-8
```

### Create Hostname File:

```zsh
nano /etc/hostname
```

```yml
NAME
```

### Setup Hosts:

```zsh
nano /etc/hosts
```

Add the following entries replacing NAME with your hostname

```yml
127.0.0.1       localhost
::1             localhost
127.0.1.1       NAME.localdomain NAME
```

### Set Root Password For Actual System:

```zsh
passwd
```

### Install General Packages:

```zsh
pacman -S grub efibootmgr networkmanager network-manager-applet dialog mtools dosfstools snapper snap-pac xdg-utils xdg-user-dirs alsa-utils inetutils base-devel openssh grub-customizer os-prober
```

select all

### Setup CPIO Modules And Hooks:

```zsh
nano /etc/mkinitcpio.conf
```

Insert `btrfs` into the brackets for modules along with your graphics card information.

- Virtualization: `vfio_pci vfio vfio_iommu_type1 vfio_virqfd`

Ensure modconf is in hooks and uncomment zstd compression

```yml
# MODULES
# The following modules are loaded before any boot hooks are
# run.  Advanced users may wish to specify all system modules
# in this array.  For instance:
MODULES=(vfio_pci vfio vfio_iommu_type1 vfio_virqfd btrfs)

##   This setup specifies all modules in the MODULES setting above.
##   No raid, lvm2, or encrypted root is needed.
#    HOOKS=(base)
#
##   This setup will autodetect all modules for your system and should
##   work as a sane default
#    HOOKS=(base udev autodetect block filesystems)
HOOKS=(base udev autodetect modconf block filesystems keyboard fsck)

# COMPRESSION
# Use this to compress the initramfs image. By default, gzip compression
# is used. Use 'cat' to create an uncompressed image.
COMPRESSION="zstd"
#COMPRESSION="gzip"
#COMPRESSION="bzip2"
#COMPRESSION="lzma"
#COMPRESSION="xz"
#COMPRESSION="lzop"
#COMPRESSION="lz4"
```

run mkinit for the chosen kernel (`linux`, `linux-lts`, `linux-zen`)

```zsh
mkinitcpio -p linux-zen
```

### Istall Grub:

Grub is the system that will locate and boot any os on your drive.

```zsh
grub-install --target=x86_64-efi --efi-directory=/boot --bootloader-id=GRUB
```

Open grub config

```zsh
nano /etc/default/grub
```

Add iommu for system into `GRUB_CMDLINE_LINUX_DEFAULT` section.

~~Amd: `amd_iommu=on`~~ This doesn't seem to be required on newer hardware...

Intel: `intel_iommu=on`

```yml
GRUB_CMDLINE_LINUX_DEFAULT="quiet intel_iommu=on loglevel=3 nowatchdog"
GRUB_CMDLINE_LINUX=""
```

Update grub

```zsh
sudo grub-mkconfig -o /boot/grub/grub.cfg
```

### Autostart Systems:

This will start the networking and ssh on boot allowing us to ssh into the machine.

```zsh
systemctl enable NetworkManager

systemctl enable sshd
```

### Create User:

Adding the user to the audio and video groups may not be necessary, this was done for gaming with multiple xorg servers.

```zsh
useradd -mG wheel NAME

passwd NAME
```

### Allow Wheel As Root:

```zsh
EDITOR=nano visudo
```

Uncomment the following

```yml
%wheel ALL=(ALL) ALL
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

## Cleanup Snapshots

At this point you have a working system that boots to a tty, however the snapshotting is not fully setup.

### Fix Snapshots:

This step allows the non root user to manage all the snapshots

```zsh
sudo umount /.snapshots

sudo rm -r /.snapshots

sudo snapper -c root create-config /

sudo btrfs su del /.snapshots

sudo mkdir /.snapshots

sudo mount -a

sudo chmod 750 /.snapshots

sudo chmod a+rx /.snapshots

sudo chown :NAME /.snapshots
```

### Modify Snapper Settings:

```zsh
sudo nano /etc/snapper/configs/root
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

### Enable Snapper:

Snapper is what creates the btrfs snapshots allowing us to roll back changes.

```zsh
sudo systemctl enable --now snapper-timeline.timer

sudo systemctl enable --now snapper-cleanup.timer
```

### Access AUR:

The arch user repository has some handy GUI packages for interacting with snapshots.

There are a few options for accessing the aur, here are two options (**I prefer paru**).

#### A - Install YAY

```zsh
git clone https://aur.archlinux.org/yay

cd yay

makepkg -si PKGBUILD

cd ..
```

#### B - Install Paru

```zsh
git clone https://aur.archlinux.org/paru.git

cd paru

makepkg -si

cd ..
```

### Install Packages From Aur

These packages will help with visually managing snapshots and booting into them. And librewolf is a hardened fork of firefox.

```zsh
yay|paru -S snap-pac-grub snapper-gui
```

___

## Desktop Setup

### Install Generic Packages:

Many of these are personal preference.

`feh` will handle the wallpaper (can also use nitrogen)

`thunar` is the file browser

`fish` is the shell

`rofi` is a package launcher similar to dmenu

`arandr` is for setting up displays (this is handy for i3wm)

`gnome-keyring` and ~~`libgnome-keyring`~~ are needed for authing nextcloud on startup. Edit: libgnome-keyring is deprecated, use `libsecret` instead

```zsh
sudo pacman -S xorg xorg-server thunar feh conky dmenu picom rsync btop mpv nextcloud-client packagekit-qt5 neofetch rofi volumeicon fish code usbutils wget numlockx noto-fonts ttf-dejavu ttf-hack ttf-roboto-mono ttf-font-awesome nerd-fonts arc-icon-theme arandr starship exa jre-openjdk jdk-openjdk keepassxc gnome-keyring libsecret code
```

### Install Browser Packages (librewolf & firefox for netflix):

```zsh
sudo pacman -S firefox

paru -S librewolf
```

### Install Terminal:

#### A - Alacritty:

```zsh
sudo pacman -S alacritty
```

#### B - WezTerm:

```zsh
paru -S wezterm
```

### Install Audio Packages:

#### A - Pulse Audio:

```zsh
sudo pacman -S pulseaudio pulseaudio-alsa pulseaudio-bluetooth
```

Bluetooth

```zsh
sudo pacman -S pulseaudio-bluetooth
```

#### B - Pipewire Audio:

```zsh
sudo pacman -S pipewire pipewire-alsa pipewire-pulse pipewire-jack wireplumber helvum qjackctl easyeffects pavucontrol

paru -S noisetorch pipewire-jack-dropin
```

### Find Graphics Card:

```zsh
lspci -k | grep -A 2 -E "(VGA|3D)"
```

### Install Graphics:

Install the packages for your hardware

#### A - Nvidia:

```zsh
sudo pacman -S nvidia nvidia-utils nvidia-settings nvidia-dkms
```

#### B - AMD:

```zsh
sudo pacman -S amdvlk mesa
```

### Setup CPIO Modules For Graphics:

Add the proper card to the end of the modules and rebuild

```zsh
nano /etc/mkinitcpio.conf
```

- Amd: `amdgpu`

- Nvidia: `nvidia`

```yml
# MODULES
# The following modules are loaded before any boot hooks are
# run.  Advanced users may wish to specify all system modules
# in this array.  For instance:
MODULES=(vfio_pci vfio vfio_iommu_type1 vfio_virqfd btrfs nvidia)
```

run mkinit for the chosen kernel (`linux`, `linux-lts`, `linux-zen`)

```zsh
mkinitcpio -p linux-zen
```

### Install DE Manager:

There are a few options for managers

#### A - Lightdm:

```zsh
paru -S lightdm-webkit-theme-aether

sudo systemctl enable lightdm
```

#### B - SDDM:

```zsh
sudo pacman -S sddm

sudo systemctl enable sddm.service
```

### Install Your DE OF Choice:

There are a few options for desktop environments

My preference is i3wm for simplicity, or KDE Plasma *cause you fancy gurl*.

#### A - i3:

```zsh
sudo pacman -S i3-gaps i3blocks i3status
```

##### COPY CONFIGS FROM GIT (Optional):

These are my own mashed together configs, mostly from my i3wm system. There are also some backgrounds in the repo.

```zsh
git clone https://github.com/rassweiler/dotfiles.git && cd dotfiles && ./install
```

~~Overwrite the .config and .local folders in your user directory and reboot the system.~~(The repo now uses dotbot to symlink all configs)

##### Edit i3wm CONFIGS (Optional):

Log into the lightdm session then press `mod(windows)+space` to bring up the rofi menu.

Then launch `arandr`.

Arandr will show you the name of the current display, use this to modify i3 configs:

```zsh
nano ~/dotfiles/config/i3/config
```

Modify the following to match your display setup (if you only have one monitor set both variables to the same name):

```yml
set $mo1 "HDMI-0" # Set this to match your display from arandr
set $mo2 "HDMI-1" # Set this to match your display from arandr
```

If you only have one display then comment out the second bar setup:

```yml
# Secondary Monitor Bar
# bar {
# 		font pango:Victor Mono Bold 10, FontAwesome 10
#         position top 
#         tray_output $mo1
#         tray_padding 0
#         output $mo2
#     strip_workspace_numbers yes
#     #strip_workspace_name no

#     colors {
#         background #282A36
#         statusline #F8F8F2
#         separator  #44475A
#         focused_workspace  #44475A #bd93f9 #F8F8F2
#         active_workspace   #282A36 #bd93f9 #F8F8F2
#         inactive_workspace #282A36 #282A36 #BFBFBF
#         urgent_workspace   #8be9fd #ff79c6 #F8F8F2
#         binding_mode       #8be9fd #ff79c6 #F8F8F2
# 	}
# }
```

#### B - KDE PLASMA:

```zsh
sudo pacman -S plasma plasma-wayland-session kde-applications
```

#### C - Awesome:

```zsh
sudo pacman -S awesome
```

### Set Shell:

the default is bash, I prefer fish... but know that some commands will need to be changed to run in fish.

Example Bash/zsh:`chsh -s $(which fish)` vs fish: `chsh -s (which zsh)`

#### A - Set ZSH Shell:

```zsh
chsh -s $(which zsh)
```

#### B - Set Fish Shell:

```zsh
.
```

### Setup Pacman Hooks For Snapper:

```zsh
sudo mkdir /etc/pacman.d/hooks

sudo nano /etc/pacman.d/hooks/50-bootbackup.hook
```

Paste in the hook information.

```yml
[Trigger]
Operation = Upgrade
Operation = Install
Operation = Remove
Type = Path
Target = boot/*

[Action]
Depends = rsync
Description = Backing up /boot...
When = PreTransaction
Exec = /usr/bin/rsync -a --delete /boot /.bootbackup
```

### Generate SSH Key And add To Agent (Optional):

```zsh
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

Fish:

```zsh
eval "(ssh-agent -s)"

exec ssh-agent fish
```

ZSH:

```zsh
eval "$(ssh-agent -s)"

exec ssh-agent zsh
```

Add the key to the shell

```zsh
ssh-add -K ~/.ssh/id_rsa
```

### Update The System:

```zsh
sudo pacman -Syu
```

___

### Enable Multilib:

This will allow us to install steam, wine, and lutris

Edit the pacman configuration

```zsh
sudo nano /etc/pacman.conf
```

uncomment Multilib and the include

```yml
[multilib]
Include = /etc/pacman.d/mirrorlist
```

### Update The System:

```zsh
sudo pacman -Syu
```

### Update User:

Adding the user to the audio and video groups may not be necessary, this was done for gaming with multiple xorg servers.

```zsh
usermod -aG audio NAME

usermod -aG video NAME
```

## Install Gaming:

```zsh
sudo pacman -S steam wine lutris wine-mono

paru -S proton proton-ge-custom mangohud streamdeck-ui
```

## OBS:

While there is a package for OBS in the main arch repo, it's suggested to use tytan652 for the extra plugins like browser source.

```zsh
paru -S obs-studio-tytan652
```

## Discord:

There are two options available: `discord` and `betterdiscord`. Install discord before betterdiscord

```zsh
sudo pacman -S discord
paru -S betterdiscord-installer
```

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

### Install packages:

```zsh
sudo pacman -S qemu libvirt ovmf virt-manager ebtables dnsmasq

usermod -aG libvirt NAME

systemctl enable libvirtd
sudo systemctl enable virtlogd.socket
sudo virsh net-autostart default
```

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
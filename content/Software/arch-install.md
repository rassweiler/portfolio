---
date: 2021-11-20T10:58:08-04:00
title: "Arch Snapper BTRFS Install Guide"
description: "Easy Install Guide For Arch Linux Using BTRFS"
featured_image: "/images/archinstall-bg.svg"
tags: ["OS","Arch","Linux","BTRFS","Snapper"]
---

This guide is for installing arch linux (UEFI) with a BTRFS file system including subvolumes. This guide also covers using snapper and grub to create bootable snapshots.

<!--more-->

___

## Step  0 - Install ISO to USB:

After downloading the latest [Arch ISO](https://archlinux.org/download/) you will need to install it to a usb using a program like [Balena Etcher](https://github.com/balena-io/etcher). Plug the usb into the machine you want to install arch to and boot into the usb.

## Step  1 - Give root a password then get the local ip:

```zsh
passwd

ip address show
```

## Step  3 - SSH into the target machine from your main:

```zsh
ssh root@xxx.xxx.xxx.xxx
```

## Step  4 - Update the timezone:

```zsh
timedatectl set-ntp true
```

## Step  5 - Update the mirrors:

This step has returned an error on me the last few times I've tried but is safe to skip.

```zsh
reflector -c Canada -c US -a 12 --protocol https --sort rate --save /etc/pacman.d/mirrorlist

pacman -Syy
```

## Step 6 - Find your device:

Use lsblk to dyplay your disk information, normally the drive will listed as SDA or SDB.

```zsh
lsblk

gdisk /dev/XXX
```

Replace XXX with the target device.

## Step 7 - Create Boot Partition:

Use the n command to create a new partition on the disk, use the default partition number, use the default first sector, offset the last sector by 512M, and give it a efi flag of ef00.

```zsh
n

default

default

+512M

ef00
```

## Step 8 - Create Swap Partition (Optional):

Creating a swap partion is optional, if this step is skipped adjust the partion numbers in the future commands.

Use the n command to create a new partition on the disk, use the default partition number, use the default first sector, offset the last sector by 2G, and give it a linux-swap flag of 8200.

```zsh
n

default

default

+2G

8200
```

## Step 9 - Create Main Partition And Write Changes:

Use the n command to create a new partition on the disk, use the default partition number, use the default first sector, since we are using the remainder of the disk we can use the default last sector, and use the default flag for linux filesystem.

```zsh
n

default

default

default

w

y
```

## Step 10 - Setup Partition Filesystems And Subvolumes:

If you skipped the swap partition then skip the mkswap and swapon and use the right partition number for the btrfs volume.

```zsh
mkfs.fat -F32 /dev/vda1

mkswap /dev/vda2

swapon /dev/vda2

mkfs.btrfs /dev/vda3

mount /dev/vda3 /mnt

btrfs su cr /mnt/@

btrfs su cr /mnt/@home

btrfs su cr /mnt/@snapshots

btrfs su cr /mnt/@var_log
```

## Step 11 - Remount Partitions Individually:

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

## Step 12 - Add desired packages (May have error about missing file fsck.btrfs):

Choose your base linux, linux-lts, linux-zen.

```zsh
pacstrap /mnt base base-devel linux-zen linux-zen-headers linux-firmware nano intel-ucode cifs-utils reflector
```

## Step 13 - Generate fstab:

```zsh
genfstab -U /mnt >> /mnt/etc/fstab
```

## Step 14 - Enter system:

```zsh
arch-chroot /mnt
```

## Step 15 - Setup System Time:

```zsh
timedatectl list-timezones | grep Toronto

ln -sf /usr/share/zoneinfo/America/Toronto /etc/localtime

hwclock --systohc
```

## Step 16 - Setup Locale Generator:

```zsh
nano /etc/locale.gen
```

Uncomment your desired locales

```yml
en_CA.UTF-8
```

## Step 17 - Generate Locale:

```zsh
locale-gen
```

## Step 18 - Update Mirrors:

*I'm currently getting an `unable to rate error` that needs investigating. This step can be skipped.*

```zsh
reflector -c Canada -c US -a 12 --protocol https --sort rate --save /etc/pacman.d/mirrorlist

pacman -Syy
```

## Step 19 - Create Locale Config:

```zsh
nano /etc/locale.conf
```

Insert you chosen language from step 16

```yml
LANG=en_CA.UTF-8
```

## Step 20 - Create Hostname File:

```zsh
nano /etc/hostname
```

```yml
NAME
```

## Step 21 - Setup Hosts:

```zsh
nano /etc/hosts
```

Add the following entries replacing NAME with your hostname

```yml
127.0.0.1       localhost
::1             localhost
127.0.1.1       NAME.localdomain NAME
```

## Step 22 - Set Root Password For Actual System:

```zsh
passwd
```

## Step 23 - Install General Packages:

Remove the items within brackets if not needed, or remove the squarebracket portion if needed

```zsh
pacman -S grub efibootmgr networkmanager network-manager-applet dialog [FOR WIFI (wpa_supplicant)] mtools dosfstools git reflector snapper snap-pac [FOR BLUETOOTH (bluez bluez-utils pulseaudio-bluetooth)] [FOR PRINTING (cups hplip)] xdg-utils xdg-user-dirs alsa-utils pulseaudio inetutils base-devel openssh grub-customizer code os-prober sudo
```

## Step 24 - Add btrfs to CPIO Modules:

*Need to investigate difference between placing it in modules vs binaries, may also need other items in modules.*

```zsh
nano /etc/mkinitcpio.conf
```

Insert `btrfs` into the brackets for modules

```yml
# MODULES
# The following modules are loaded before any boot hooks are
# run.  Advanced users may wish to specify all system modules
# in this array.  For instance:
MODULES=(btrfs)
```

run mkinit for the chosen kernel (linux, linux-lts, linux-zen)

```zsh
mkinitcpio -p linux-zen
```

## Step 25 - Istall Grub:

Grub is the system that will locate and boot any os on your drive.

```zsh
grub-install --target=x86_64-efi --efi-directory=/boot --bootloader-id=GRUB

grub-mkconfig -o /boot/grub/grub.cfg
```

## Step 26 - Autostart Systems:

This will start the networking and ssh on boot allowing us to ssh into the machine.

```zsh
systemctl enable NetworkManager

systemctl enable sshd
```

## Step 27 - Create User:

Adding the user to the audio and video groups may not be necessary, this was done for gaming with multiple xorg servers.

```zsh
useradd -mG wheel NAME

usermod -aG audio NAME

usermod -aG video NAME

passwd NAME
```

## Step 28 - Allow Wheel As Root:

```zsh
EDITOR=nano visudo
```

Uncomment the following

```yml
%wheel ALL=(ALL) ALL
```

## Step 29 - Finish Setup And Reboot:

```zsh
exit

umount -a

reboot
```

## Step 30 - SSH Into Machine As New User:

```zsh
ssh NAME@xxx.xxx.xxx.xxx
```

## Step 31 - Fix Snapshots:

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

sudo chown :kr /.snapshots
```

## Step 32 - Modify Snapper Settings:

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

## Step 32 - Enable Snapper:

Snapper is what creates the btrfs snapshots allowing us to roll back changes.

```zsh
sudo systemctl enable --now snapper-timeline.timer

sudo systemctl enable --now snapper-cleanup.timer
```

## Step 33 - Access AUR:

The arch user repository has some handy GUI packages for interacting with snapshots.

There are a few options for accessing the aur, here are two options (**I prefer paru**).

### Step 33.A - Install YAY

```zsh
git clone https://aur.archlinux.org/yay

cd yay

makepkg -si PKGBUILD

cd ..
```

### Step 33.B - Install Paru

```zsh
git clone https://aur.archlinux.org/paru.git

cd paru

makepkg -si

cd ..
```

## Step 34 - Install Packages From Aur

These packages will help with visually managing snapshots and booting into them. And librewolf is a hardened fork of firefox.

```zsh
yay|paru -S snap-pac-grub snapper-gui librewolf streamdeck-ui
```

## Step 35 - Install Generic Packages:

Many of these are personal preference.

`feh` will handle the wallpaper (can also use nitrogen)

`thunar` is the file browser

`alacritty` is the terminal emulator

`fish` is the shell

`rofi` is a package launcher similar to dmenu

`arandr` is for setting up displays (this is handy for i3wm)

```zsh
sudo pacman -S xorg xorg-server alacritty thunar feh conky dmenu picom rsync btop mpv nextcloud-client packagekit-qt5 neofetch rofi volumeicon fish code usbutils wget numlockx noto-fonts ttf-dejavu ttf-hack ttf-roboto-mono ttf-font-awesome nerd-fonts arc-icon-theme arandr starship exa jre-openjdk jdk-openjdk keepassxc gnome-keyring libgnome-keyring
```

## Step 35.5 - Install Audio Packages:

### Step 35.5.A - Pulse Audio:

```zsh
sudo pacman -S pulseaudio pulseaudio-alsa
```

### Step 35.5.B - Pipewire Audio:

```zsh
sudo pacman -S pipewire pipewire-alsa pipewire-pulse pipewire-jack wireplumber helvum easyeffects|noisetorch
```

## Step 36 - Find Graphics Card:

```zsh
lspci -k | grep -A 2 -E "(VGA|3D)"
```

## Step 37 - Install Graphics:

Install the packages for your hardware

### Step 37.A - Nvidia:

```zsh
sudo pacman -S nvidia nvidia-utils nvidia-settings nvidia-dkms
```

### Step 37.B - AMD:

```zsh
sudo pacman -S amdvlk mesa
```

## Step 38 - Install DE Manager:

There are a few options for managers

### Step 38.A - Lightdm:

```zsh
paru -S lightdm-webkit-theme-aether

sudo systemctl enable lightdm
```

### Step 38.B - SDDM:

```zsh
sudo pacman -S sddm

sudo systemctl enable sddm.service
```

## Step 39 - Install Your DE OF Choice:

There are a few options for desktop environments

My preference is i3wm for simplicity, or KDE Plasma *cause you fancy gurl*.

### Step 39.A - i3:

```zsh
sudo pacman -S i3-gaps i3blocks i3status
```

### Step 39.B - KDE PLASMA:

```zsh
sudo pacman -S plasma plasma-wayland-session kde-applications
```

### Step 39.C - Awesome:

```zsh
sudo pacman -S awesome
```

## Step 40 - Set Shell:

the default is bash, I prefer fish... but know that some commands will need to be changed to run in fish.

Example Bash/zsh:`chsh -s $(which fish)` vs fish: `chsh -s (which zsh)`

### Step 40.A - Set ZSH Shell:

```zsh
chsh -s $(which zsh)
```

### Step 40.B - Set Fish Shell:

```zsh
chsh -s $(which fish)
```

## Step 41 - Setup Pacman Hooks For Snapper:

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

## Step 42 - Generate SSH Key And add To Agent (Optional):

```zsh
sh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

Fish:

```zsh
eval (ssh-agent -s)

exec ssh-agent fish
```

ZSH:

```zsh
eval "$(ssh-agent -s)"

exec ssh-agent zsh
```

Add the key to the shell

```zsh
ssh-add -K ~/.ssh/id_ed25519
```

## Step 43 - COPY CONFIGS FROM GIT (Optional):

These are my own mashed together configs, mostly from my i3wm system. There are also some backgrounds in the repo.

```zsh
git clone https://github.com/rassweiler/dotfiles.git && cd dotfiles && ./install
```

~~Overwrite the .config and .local folders in your user directory and reboot the system.~~

The repo now uses dotbot to symlink all configs.

## Step 44 - Enable Multilib (Optional):

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

## Step 45 - Update The System:

```zsh
sudo pacman -Syu
```

## Step 46 - Install Gaming (Optional):

```zsh
sudo pacman -S steam wine lutris

paru -S proton proton-ge-custom
```

## Step 47 - Tuning (Optional):

### Step 46.A - Pulse Audio:

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
---
date: 2021-11-20T10:58:08-04:00
title: "Arch Linux i3wm Install Guide"
description: "Easy Install Guide For Arch Linux"
featured_image: "/images/archinstall-bg.png"
tags: ["OS","Arch","Linux","BTRFS","Snapper","i3WM"]
---

*Updated: 2022-04-22*

This guide is for installing arch linux (UEFI) with Xorg, i3wm, Lightdm, Paru, BTRFS, Snapper, Snap-pac-grub, Snapshots, Qemu, KVM, and Gaming.

<!--more-->

___

## Script Install Guide:
[Arch Script Install](https://www.kylerassweiler.ca/arch-install-script/)

___

## Install ISO to USB:

After downloading the latest [Arch ISO](https://archlinux.org/download/) you will need to install it to a usb using a program like [Balena Etcher](https://github.com/balena-io/etcher). Plug the usb into the machine you want to install arch to and boot into the usb.

___

## VM Setup

{{< figure src="/images/arch-sway-01.png" title="Qemu display settings" link="/images/arch-sway-01.png" >}}

{{< figure src="/images/arch-sway-02.png" title="Qemu video settings" link="/images/arch-sway-02.png" >}}
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
```

### Wipe Existing BTRFS Systems:

```zsh
gdisk /dev/XXX
```

### Edit Filesystem:

Replace XXX with the target device. Gdisk is for GPT partitions and UEFI, use Fdisk for mbr partitions and bios boot.

```zsh
gdisk /dev/XXX
```

### Create Boot Partition:

Use the n command to create a new partition on the disk, use the default partition number, use the default first sector, offset the last sector by 512M, and give it a efi flag of ef00.

```zsh
n

default

default

+512M

ef00
```

### ~~Create Swap Partition (Optional)~~:

We will instead use zramd from the aur or zram-generator from the main repo at a later point

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

mkfs.btrfs /dev/vda2

mount /dev/vda2 /mnt

cd /mnt

btrfs su cr @

btrfs su cr @home

btrfs su cr @snapshots

btrfs su cr @var_log

cd ..
```

#### BTRFS Raids Side Note (TODO: INVESTIGATE):

```zsh
mkfs.btrfs -m raid1 -d raid1 /dev/vdaX /dev/vdaY
```

### Remount Partitions Individually:

In order to setup the systems fstab we need to remount the partitions individually with the proper settings. 

Use lsblk to verify all partitions and volumes were mounted.

```zsh
umount /mnt

mount -o noatime,compress=zstd,space_cache=v2,discard=async,subvol=@ /dev/vda2 /mnt

mkdir -p /mnt/{boot,home,.snapshots,var/log}

mount -o noatime,compress=zstd,space_cache=v2,discard=async,subvol=@home /dev/vda2 /mnt/home

mount -o noatime,compress=zstd,space_cache=v2,discard=async,subvol=@snapshots /dev/vda2 /mnt/.snapshots

mount -o noatime,compress=zstd,space_cache=v2,discard=async,subvol=@var_log /dev/vda2 /mnt/var/log

mount /dev/vda1 /mnt/boot

lsblk
```

### Add desired packages (May have error about missing file fsck.btrfs):

Choose your base: `linux, linux-lts, linux-zen`.

Choose your ucode: `intel-ucode, amd-ucode`.

```zsh
pacstrap /mnt base linux-zen linux-zen-headers linux-firmware amd-ucode intel-ucode btrfs-progs nano reflector sudo git rsync
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
en_US.UTF-8
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
#reflector -c Canada -c US -a 6 --sort rate --save /etc/pacman.d/mirrorlist

reflector --country Canada,USA --age 12 --protocol https --sort rate --save /etc/pacman.d/mirrorlist

pacman -Syy
```

### Create Locale Config:

```zsh
nano /etc/locale.conf
```

Insert you chosen language from step 16

```yml
LANG=en_US.UTF-8
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

### Enable Multilib:

This will allow us to install steam, wine, and lutris

Edit the pacman configuration

```zsh
nano /etc/pacman.conf
```

uncomment Multilib and the include

```yml
[multilib]
Include = /etc/pacman.d/mirrorlist
```

update system:

```zsh
pacman -Syu
```

### Create User:

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
%wheel ALL=(ALL:ALL) ALL
```

### Install Packages:

`avahi` is for dns service discovery

`gvfs` is gnome virtual filesystem

`xdg` helps apps integrade with the desktop

`cups` is printer support

`mtools` provides dos file support

`acpi` provides power support

`ipset` maintain set of ips for firewall

`fish` is an alternative to bash 

`ntfs-3g` is an open source MS NTFS implementation

`iptables-nft` is a modern version of iptables, ok to replace

**WARNING** xdg-desktop-portal will request a repo for xdg-desktop-portal-impl, choose the gtk version.

**WARNING** choose Y to remove iptables

```zsh
pacman -S xdg-desktop-portal base-devel grub grub-btrfs efibootmgr networkmanager network-manager-applet dialog avahi gvfs gvfs-smb nfs-utils cifs-utils ntfs-3g inetutils dnsutils mtools dosfstools snapper snap-pac xdg-utils xdg-user-dirs alsa-utils inetutils usbutils openssh grub-customizer os-prober cups acpi acpi_call acpid iptables-nft ipset firewalld nss-mdns bash-completion fish archlinux-keyring hwinfo upower

systemctl enable NetworkManager
systemctl enable cups.service
systemctl enable sshd
systemctl enable avahi-daemon
systemctl enable reflector.timer
systemctl enable fstrim.timer
systemctl enable firewalld
systemctl enable acpid
systemctl enable upower
```

#### Audio:

```zsh
pacman -S sof-firmware pipewire pipewire-jack pipewire-alsa pipewire-pulse pipewire-media-session pavucontrol
```

#### Laptop extras:

`tlp` is for battery power saving

```zsh
pacman -S wpa_supplicant tlp

systemctl enable tlp
```

#### Bluetooth extras:

```zsh
pacman -S bluez bluez-utils

systemctl enable bluetooth
```

#### VM:

```zsh
pacman -S virt-manager qemu qemu-arch-extra vde2 bridge-utils dnsmasq openbsd-netcat libvirt ovmf

systemctl enable libvirtd
systemctl enable virtlogd.socket
virsh net-autostart default
```

#### Graphics:

Nouveu:

```zsh
pacman -S mesa lib32-mesa
```

Nvidia:

```zsh
pacman -S nvidia nvidia-utils nvidia-settings nvidia-dkms
```

AMD:

```zsh
pacman -S mesa lib32-mesa vulkan-radeon
```

### Setup CPIO Modules And Hooks:

```zsh
nano /etc/mkinitcpio.conf
```

Insert `btrfs` and other items into the brackets for modules.

- Virtualization: `vfio_pci vfio vfio_iommu_type1 vfio_virqfd`

- Nouveau: `nouveau`

- Amd: `amdgpu`

- Nvidia: `nvidia`

Ensure modconf is in hooks and uncomment zstd compression

```yml
# MODULES
# The following modules are loaded before any boot hooks are
# run.  Advanced users may wish to specify all system modules
# in this array.  For instance:
MODULES=(vfio_pci vfio vfio_iommu_type1 vfio_virqfd btrfs nvidia)

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

Amd: `amd_iommu=on`

Intel: `intel_iommu=on`

Passthrough: `iommu=pt`

VM: `video=1920x1080` Or the desired resolution

```yml
GRUB_CMDLINE_LINUX_DEFAULT="quiet intel_iommu=on iommu=pt loglevel=3 nowatchdog"
GRUB_CMDLINE_LINUX=""
```

Uncomment the os_prober section

```yml
# Probing for other operating systems is disabled for security reasons. Read
# documentation on GRUB_DISABLE_OS_PROBER, if still want to enable this
# functionality install os-prober and uncomment to detect and include other
# operating systems.
GRUB_DISABLE_OS_PROBER=false
```

Update grub

```zsh
sudo grub-mkconfig -o /boot/grub/grub.cfg
```

### Finish Setup And Reboot:

```zsh
exit

umount -a

reboot
```

___


## Desktop and Usability

### SSH Into Machine As New User:

```zsh
ssh NAME@xxx.xxx.xxx.xxx
```

### Update the timezone:

```zsh
timedatectl set-ntp true
```

### Access AUR with Paru:

The arch user repository has some handy GUI packages for interacting with snapshots.

There are a few options for accessing the aur (**I prefer paru**).

```zsh
cd /tmp

git clone https://aur.archlinux.org/paru.git

cd paru

makepkg -si

cd ~
```

### Setup fonts and icons:

```zsh
paru -S nerd-fonts-complete

sudo pacman -S arc-icon-theme
```

### Setup zram:

```zsh
paru -S zramd
```

Edit the config for your setup

```zsh
sudo nano /etc/default/zramd
```

```yml
# Max total swap size in MB
 MAX_SIZE=8192

# Number of zram devices to create
 NUM_DEVICES=1
```

```zsh
sudo systemctl enable --now zramd.service
```

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

### Setup Snapper:

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

Snapper is what creates the btrfs snapshots allowing us to roll back changes.

```zsh
sudo systemctl enable --now snapper-timeline.timer

sudo systemctl enable --now snapper-cleanup.timer
```

```zsh
paru -S snap-pac-grub snapper-gui
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
Target = usr/lib/modules/*/vmlinuz

[Action]
Depends = rsync
Description = Backing up /boot...
When = PostTransaction
Exec = /usr/bin/rsync -a --delete /boot /.bootbackup
```

### Install i3wm + DE:

`obs-studio-tytan652` has better plugins packaged vs `obs` from main

`feh` will handle the wallpaper (can also use nitrogen)

`thunar` is the file browser

`fish` is the shell

`wezterm` is the terminal emulator

`rofi` is a package launcher similar to dmenu

`arandr` is for setting up displays (this is handy for i3wm)

`lsd` is the next gen ls command

`exa` is a modern replacement for ls. It uses colours for information by default, helping you distinguish between many types of files, such as whether you are the owner, or in the owning group

`gvfs` is for remote file support

`tumbler` is for auto generating thunar thumbnails

`thunar-volman` is for removable device management

`thunar-archive-plugin` is for archive creation

`thunar-media-tags-plugin` is to view/edit tags

`gnome-keyring` and ~~`libgnome-keyring`~~ are needed for authing nextcloud on startup. Edit: libgnome-keyring is deprecated, use `libsecret` instead

~~`lightdm-webkit-theme-litarvan`~~ is the desktop manager

`ly` is a simple desktop manager

```zsh
sudo pacman -S xorg xorg-server xorg-init xterm i3-gaps i3blocks i3status thunar feh dmenu picom btop mpv nextcloud-client packagekit-qt5 rofi volumeicon firefox neofetch starship code keepassxc gnome-keyring libsecret xfce4-settings lsd exa lm_sensors steam wine-staging lutris wine-mono discord mousepad bat gvfs gvfs-mtp wget usbutils numlockx arandr jre-openjdk jdk-openjdk file-roller flameshot tumbler thunar-volman thunar-archive-plugin thunar-media-tags-plugin

paru -S ly-git

paru -S wezterm jellyfin-media-player haruna proton proton-ge-custom protonup-qt betterdiscord-installer obs-studio-tytan652 mangohud gimp jmtpfs librewolf autotiling

sudo systemctl enable ly.service
```

### COPY CONFIGS FROM GIT (Optional):

These are my own mashed together configs, mostly from my i3wm system. There are also some backgrounds in the repo.

```zsh
git clone https://github.com/rassweiler/dotfiles.git && cd dotfiles && ./install
```

### ~~Set Lightdm Theme~~:

```zsh
sudo nano /etc/lightdm/lightdm.conf
```

Set the greeter session to lightdm-webkit2-greeter

```yml
#xdmcp-key=
greeter-session=lightdm-webkit2-greeter
```

```zsh
sudo nano /etc/lightdm/lightdm-webkit2-greeter.conf
```

Set the lightdm theme to litarvan

```yml
time_language       = auto
#webkit_theme        = antergos
webkit_theme        = litarvan
```

### Set Theme:

```zsh
gsettings set org.gnome.desktop.interface gtk-theme 'Dracula'

gsettings set org.gnome.desktop.wm.preferences theme 'Dracula'

gsettings set org.gnome.desktop.interface icon-theme 'Dracula'
```

### Set Shell:

```zsh
chsh -s $(which fish)
```

### Install Extra Audio Packages:

```zsh
paru -S carla noise-repellent calf
```

### Update User:

Adding the user to the audio and video groups may not be necessary, this was done for gaming with multiple xorg servers.

```zsh
sudo usermod -aG audio NAME

sudo usermod -aG video NAME

sudo usermod -aG libvirt NAME
```

### Generate SSH Key And add To Agent:

```zsh
ssh-keygen -t ed25519 -C "your_email@example.com"

eval (ssh-agent -c)

ssh-add ~/.ssh/id_ed25519
```

### Gaming Extras For Wine/Lutris:

```zsh
sudo pacman -S winetricks
```

Extra wine packages

```
sudo pacman -S giflib lib32-giflib libpng lib32-libpng libldap lib32-libldap gnutls lib32-gnutls mpg123 lib32-mpg123 openal lib32-openal v4l-utils lib32-v4l-utils libpulse lib32-libpulse alsa-plugins lib32-alsa-plugins alsa-lib lib32-alsa-lib libjpeg-turbo lib32-libjpeg-turbo libxcomposite lib32-libxcomposite libxinerama lib32-libxinerama ncurses lib32-ncurses opencl-icd-loader lib32-opencl-icd-loader libxslt lib32-libxslt libva lib32-libva gtk3 lib32-gtk3 gst-plugins-base-libs lib32-gst-plugins-base-libs vulkan-icd-loader lib32-vulkan-icd-loader samba dosbox
```

### Install Betterdiscord:

```zsh
sudo betterdiscord-installer
```

### Setup Libvirtd:

```zsh
sudo nano /etc/libvirt/libvirtd.conf
```

Set group to use libvirt with 770 permissions

```yml
# Set the UNIX domain socket group ownership. This can be used to
# allow a 'trusted' set of users access to management capabilities
# without becoming root.
#
# This setting is not required or honoured if using systemd socket
# activation.
#
# This is restricted to 'root' by default.
unix_sock_group = "libvirt"

# Set the UNIX socket permissions for the R/W socket. This is used
# for full management of VMs
#
# This setting is not required or honoured if using systemd socket
# activation.
#
# Default allows only root. If PolicyKit is enabled on the socket,
# the default will change to allow everyone (eg, 0777)
#
# If not using PolicyKit and setting group ownership for access
# control, then you may want to relax this too.
unix_sock_rw_perms = "0770"
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

___

### REFERENCES

- [Arch Install Guide](https://wiki.archlinux.org/title/Installation_guide)
- [Arch PCI Passthrough](https://wiki.archlinux.org/title/PCI_passthrough_via_OVMF)
- [SomeOrdinaryGamer](https://www.youtube.com/watch?v=h7SG7ccjn-g)
- [EF - Linux Made Simple](https://www.youtube.com/watch?v=o09jzArQcFQ)
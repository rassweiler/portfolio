---
date: 2023-11-12T19:00:08-04:00
title: "Arch Linux Awesomewm Install Guide"
description: "Easy Install Guide For Arch Linux With Awesomewm"
hero: "images/Awesomewm.png"
tags: ["OS","Arch","Linux","BTRFS","Awesomewm"]
categories: ["Software","Linux"]
---

This guide is for installing arch linux (UEFI) with xorg, Awesomewm, SDDM, Paru, BTRFS, Snapshots, Qemu, KVM, and Gaming.

<!--more-->

___

## Install ISO to USB:

After downloading the latest [Arch ISO](https://archlinux.org/download/) you will need to install it to a usb using a program like [Balena Etcher](https://github.com/balena-io/etcher). Plug the usb into the machine you want to install arch to and boot into the usb.

___

## Base Install

### Set Pacman Confs

Use nano or vim to edit the /etc/pacman.conf file:

```yml
Color # Uncomment this line
ParallelDownloads = 5 # Uncomment this line
```

Then update pacman:

```zsh
pacman -Sy
```

### Update Keyring and Archinstall

Once booted into the arch live ISO you need to update the keyring and archinstall packages:

```zsh
pacman -S archlinux-keyring archinstall
```

### Run Archinstall Script

Run the built in archinstall script:

```zsh
archinstall
```
### The Basics

{{< figure src="images/Archinstaller_Base.png" title="Archinstall base" link="images/Archinstaller_Base.png" >}}

In the installer setup the base system:
- Pick your local mirror
- Setup your locale
- Set the disk configuration, use best effort default with btrfs and subvolumes
- Choose the bootloader
- Setup swap
- Set the host name
- Set the root password
- Create a user account
- Select the pipewire audio `May have an issue due to a bug in older install scripts`
- Select the kernel
- Set the network config
- Set the time zone
- Set the time sync
- Enable the multilib repository in optional repositories

### Profile

Select the awesomewm profile and take note of the installed packages:

{{< figure src="images/Archinstaller_Profile_Awesome.png" title="Archinstall Awesomewm profile" link="images/Archinstaller_Profile_Awesome.png" >}}

### Additional Packages

Add the following packages to the base install (This setup is based on an AMD CPU with Nvidia GPU and Linux Zen):

- `dunst` is the notification package.
- `polkit` is the polkit package.
- `fish` is a shell.
- `python-pywal` is the colour scheme package.
- `rustup` is the rust updater package.
- `iwd` is the wireless networking package.
- `gnome-keyring` is needed for nextcloud-client.
- `libsecret` is needed for nextcloud-client.
- `network-manager-applet` is the taskbar display for `NetworkManager`
- `util-linux` contains the tool for disk partitioning

```zsh
intel-ucode amd-ucode polkit git fish base-devel python-pywal rustup networkmanager network-manager-applet iwd dhcpcd gnome-keyring libsecret linux-zen-headers wget util-linux openssh pacman-contrib cpupower acpi wireless_tools xdg-utils numlockx fd dosfstools
```

### Finish Installer

Once everything is setup to your needs select the install option.

## Post Install

After the installer finishes choose the option to chroot into the new system before restarting to finish up the install:
{{< figure src="images/Archinstaller_Completed.png" title="Archinstall completed" link="images/Archinstaller_Completed.png" >}}

Make sure to switch to user level:

```zsh
su [username]
```

### SSH Agent

Change default shell to fish:

```zsh
systemctl --user enable ssh-agent.service
```

### Fish

Change default shell to fish:

```zsh
chsh -s /bin/fish
```

### Config System With Dotfiles:

This will link the config files over then install all the remaining packages:

```zsh
git clone https://github.com/rassweiler/dotfiles.git
cd dotfiles
git checkout arch-awesome
./install
./init.sh
```

### Setup LightDM:

```zsh
sudo nvim /etc/lightdm/lightdm.conf
```

Change the theme value:

```yml
[Seat:*]
greeter-session=lightdm-slick-greeter
```

### Setup Git:

```zsh
git config --global user.name "Your Name"
git config --global user.email "youremail@yourdomain.com"
```

### Mkinitcpio Setup:

- Update mkinit by adding `nvidia nvidia_modeset nvidia_uvm nvidia_drm` to the *MODULES* section of `/etc/mkinitcpio.conf`:

```zsh
sudo nvim /etc/mkinitcpio.conf
```

```yml
MODULES=(btrfs nvidia nvidia_modeset nvidia_uvm nvidia_drm)
```

then running the generator:

```zsh
mkinitcpio -p linux-zen
```

### Remote Desktop Server Setup:

This will allow RDP connections:

```zsh
paru -S xrdp
sudo systemctl enable xrdp.service
```

### Complete and Exit

```zsh
exit
exit
reboot
```

## First Boot

Log into the machine and open the terminal

{{< figure src="images/SDDM_Login.png" title="Login Screen" link="images/SDDM_Login.png" >}}

## Finish Setup

### VM Auto Start:

```zsh
sudovirsh net-autostart default
```
___

## REFERENCES

- [Arch Install Guide](https://wiki.archlinux.org/title/Installation_guide)
- [Arch PCI Passthrough](https://wiki.archlinux.org/title/PCI_passthrough_via_OVMF)
- [Arch awesomewm](https://wiki.archlinux.org/title/awesome)
- [Awesomewm Docs](https://awesomewm.org/)

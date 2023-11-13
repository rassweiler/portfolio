---
date: 2023-11-12T19:00:08-04:00
title: "Arch Linux Awesomewm Install Guide"
description: "Easy Install Guide For Arch Linux With Awesomewm"
hero: "images/archinstall-bg.webp"
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

- `libnotify` is the notification package.
- `nvidia-dkms` is the graphics driver package.
- `polkit` is the polkit package.
- `sddm` is the greeter package.
- `qt5ct` is the Qt5 configuration package.
- `libva` is the video Acceleration package.
- `rofi` is the modal package.
- `wezterm` is the terminal package.
- `thunar` is the file explorer package.
- `neovim` is the terminal editor package.
- `fish` is a shell.
- `gvfs` is the mounting and trash package.
- `tumbler` is the thumbnail package.
- `python-pywal` is the colour scheme package.
- `lsd` is the upgraded ls package.
- `rustup` is the rust updater package.
- `iwd` is the wireless networking package.
- `gnome-keyring` is needed for nextcloud-client.
- `libsecret` is needed for nextcloud-client.
- `network-manager-applet` is the taskbar display for `NetworkManager`
- `util-linux` contains the tool for disk partitioning

```zsh
libnotify nvidia nvidia-dkms nvidia-utils nvidia-settings amd-ucode polkit sddm qt5ct libva rofi git wezterm thunar neovim code firefox fish base-devel gvfs tumbler python-pywal rustup lsd networkmanager network-manager-applet iwd dhcpcd gnome-keyring libsecret less linux-zen-headers wget util-linux openssh
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

### Fish

Change default shell to fish:

```zsh
chsh -s /bin/fish
```

### Rustup

Rust will be needed to compile paru:

```zsh
rustup toolchain install stable
rustup default stable
```

### Paru

Installing Paru will allow access to the AUR, make sure to have switched to the user level first:

```zsh
cd /tmp
git clone https://aur.archlinux.org/paru.git
cd paru
makepkg -si
cd ~
paru -Syu
```

### Install VM & AUR Packages

Install final packages, select Y to replace iptables:

- `flameshot` is the screenshot package.

```zsh
sudo pacman -S pacman-contrib swtpm virt-manager virt-viewer vde2 iptables-nft dnsmasq bridge-utils libvirt libvpx libde265 virtiofsd xvidcore winetricks vulkan-icd-loader lib32-vulkan-icd-loader eza freerdp thunar-volman thunar-archive-plugin thunar-media-tags-plugin lib32-nvidia-utils libreoffice-still godot blender gimp inkscape keepassxc obs-studio lutris steam discord nerd-fonts kdenlive file-roller pavucontrol mpv nextcloud-client rofi-calc nfs-utils ttf-font-awesome ttf-fira-sans ttf-fira-code ttf-firacode-nerd wireplumber neofetch starship cpupower acpi thunderbird flameshot awesome-terminal-fonts ttf-liberation noto-fonts-emoji btop dmenu volumeicon wireless_tools xdg-utils nitrogen pipewire-pulse pipewire-jack pipewire-alsa picom edk2-ovmf gst-plugin-pipewire gvfs-mtp libpulse numlockx
```

If the machine is a VM install the agents:

```zsh
sudo pacman -S qemu-guest-agent spice-vdagent
```

Install the rest of the packages from the AUR:

```zsh
paru -S jellyfin-media-player arc-icon-theme mangohud jmtpfs sddm-sugar-dark ant-dracula-gtk-theme trizen libva-nvidia-driver-git ovmf qemu-arch-extra ebtables bibata-cursor-theme xfce-polkit
```

### Setup Nvidia:

```zsh
sudo systemctl enable nvidia-persistenced.service
```

### Setup SDDM:

```zsh
sudo systemctl enable sddm
sudo mkdir /etc/sddm.conf.d
sudo cp /usr/lib/sddm/sddm.conf.d/default.conf /etc/sddm.conf.d/sddm.conf
sudo nvim /etc/sddm.conf.d/sddm.conf
```

Change the theme value:

```yml
[Theme]
Current=sugar-dark
```

### Setup VM:

```zsh
sudo systemctl enable libvirtd
sudo systemctl enable virtlogd.socket
sudo usermod -aG kvm,libvirt [user_name]
```

### Setup Git:

```zsh
git config --global user.name "Your Name"
git config --global user.email "youremail@yourdomain.com"
```

### Nvidia BS For Hyprland

**Nvidia** is notoriously garbage for Linux and will need several tweaks:

- Update systemd-boot by adding `nvidia_drm.modeset=1` to the end of `/boot/loader/entries/[ENTRY_NAME].conf`:

```zsh
sudo nvim /boot/loader/entries/[ENTRY_NAME].conf
```

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
#sudo mkinitcpio --config /etc/mkinitcpio.conf --generate /boot/initramfs-custom.img
```
- Add `options nvidia-drm modeset=1` to the end of `/etc/modprobe.d/nvidia.conf`, create the file if non existant:

```zsh
sudo nvim /etc/modprobe.d/nvidia.conf
```

```yml
options nvidia-drm modeset=1
```

### Remote Setup

```zsh
sudo pacman -S freerdp
paru -S xrdp
sudo systemctl enable xrdp.service
```

### Config Awesome With Dotfiles:

If using dotfiles:

```zsh
git clone https://github.com/rassweiler/dotfiles.git
cd dotfiles
git checkout arch-awesome
./install
./init.sh
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

### Config Hyprland Without Dotfiles:

Since we aren't using kitty or dolphin we need to change some config options before boot:

```zsh
cp /usr
nvim ~/.config/hypr/hyperland.conf
```

Comment out the warning:

```yml
#autogenerated = 1
```

Uncomment and modify the following:

```yml
exec-once = waybar

bind = $mainMod, Q, exec, wezterm
bind = $mainMod, E, exec, thunar
```

### Set Themes

Set the GTK themes if **NOT** using my configs:

```zsh
gsettings set org.gnome.desktop.interface gtk-theme "Dracula"
gsettings set org.gnome.desktop.wm.preferences theme "Dracula"
gsettings set org.gnome.desktop.interface icon-theme "Dracula"
gsettings set org.gnome.desktop.interface color-scheme "prefer-dark"
```

### VM

```zsh
sudovirsh net-autostart default
```

### Pywal If Not Using Dotfiles

```zsh
pywal -i [path_to_image]
```
___

## REFERENCES

- [Arch Install Guide](https://wiki.archlinux.org/title/Installation_guide)
- [Arch PCI Passthrough](https://wiki.archlinux.org/title/PCI_passthrough_via_OVMF)
- [Arch awesomewm](https://wiki.archlinux.org/title/awesome)
- [Awesomewm Docs](https://awesomewm.org/)

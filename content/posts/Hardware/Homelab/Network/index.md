---
date: 2021-01-09T10:58:08-04:00
title: "Network Upgrade"
description: "Virtual Machines, Storage, and Streaming"
hero: "images/network-bg.webp"
tags: ["Network","Unify","10G","Jellyfin","Proxmox","Komga","Truenas","Radarr","Lidarr","NZBHydra2","Readarr","Mylar"]
categories: ["Hardware","Homelab"]
---

My attempt to replace subscriptions and automate manual media tasks. Services to be replaced: Spotify, Netflix, Amazon Books, Google Drive, Gmail, Google Calendar, Trello, Google Contacts, Zoom.

<!--more-->

___

## Network Layout 

First off, yes, I'm aware that this layout is poor...

The router/wan combo has been replaced by a Dreammachine pro and WAP, among other changes not listed here (*Sue me, I'm too lazy to update the flow chart*).

{{< figure src="images/network-bg.webp" title="Network Layout" link="images/network-bg.webp" >}}

___

## Storage

The storage server is a Supermicro 6047R-E1R72L running TrueNAS. Pool names are determined by several factors: `(use)-(Number of Drives in vdev)x(Size of Individual Drives)-(Compression Level)`, so the media pool would be: `Media-6x4TB-Z2`. 

The server has 4 1G NICs available, my setup uses one of them for non priority traffic such as [QBittorrent](https://github.com/qbittorrent/qBittorrent). I've also installed a SFP+ card(*10GTek Intel Card*) for media traffic over fibre lines to my Jellyfin server. 

This section is also a bit out of date as I've reached the media pool's limit several times already. I've also learned the importance of clearing out old snapshots when the backup pool reached 100% usage... Followed by a day of troubleshooting what was using the space.

{{< figure src="images/network-truenas-01.webp" title="Truenas Storage UI" link="images/network-truenas-01.webp" >}}

___

## Netflix & Spotify Replacement

I use a [Jellyfin server](https://github.com/jellyfin/jellyfin) (similar to plex) to serve movies, music, and tv shows. The mobile client allows me to download or stream my media for offline play.

Originally I was using Emby, however there was an issue with them closing off their source. Jellyfin is a FOSS fork of Emby before the fall.

{{< figure src="images/network-jellyfin-01.webp" title="Jellyfin Media Server UI" link="images/network-jellyfin-01.webp" >}}

___

## Amazon Books & Comic Stream Replacement

For all of my digital reading needs I have [Komga](https://github.com/gotson/komga) serving up my PDFs, EPUBs, CBRs, CBZs, etc... It's listed as a comic and manga server but it can handle manuals and textbooks just fine.

On the android mobile end I use Tachiyomi with the Komga extension to access my books.

{{< figure src="images/network-komga-01.webp" title="Komga Book Server UI" link="images/network-komga-01.webp" >}}

___

## Media Automation & Organisation

All the media is organised into a proper folder structure for each server with all meta data collected.

### Jackett

[Jackett](https://github.com/Jackett/Jackett) contains a list of places to find torrents and their connection information. 

From their github:
`It translates queries from apps (Sonarr, Radarr, SickRage, CouchPotato, Mylar3, Lidarr, DuckieTV, qBittorrent, Nefarious etc.) into tracker-site-specific http queries, parses the html or json response, and then sends results back to the requesting software`

{{< figure src="images/network-jackett-01.webp" title="Jackett UI" link="images/network-jackett-01.webp" >}}

### NZBHydra2

[NZBHydra2](https://github.com/theotherp/nzbhydra2) is a single point for conncting to various download sources, making it easier configure various servers. 

From their github:
`NZBHydra 2 is a meta search for newznab indexers and torznab trackers. It provides easy access to newznab indexers and many torznab trackers via Jackett. You can search all your indexers and trackers from one place and use it as an indexer source for tools like Sonarr, Radarr, Lidarr or CouchPotato.`

{{< figure src="images/network-nzbhydra2-01.webp" title="NZBHydra2 UI" link="images/network-nzbhydra2-01.webp" >}}

### Sonarr

[Sonarr](https://github.com/Sonarr/Sonarr) is used for organising TV media and metadata such as descriptions, names, and actors. It can also be used to keep track of air dates and automate the aquisition by coordinating with an indexer and torrent client.

Typical flow: *Sonarr/Radarr/Lidarr/Mylar -> NZBHydra2 -> Jackett -> NZBHydra2 -> Sonarr/Radarr/Lidarr/Mylar -> QBittorrent*

From their github:
`Sonarr is a PVR for Usenet and BitTorrent users. It can monitor multiple RSS feeds for new episodes of your favorite shows and will grab, sort and rename them. It can also be configured to automatically upgrade the quality of files already downloaded when a better quality format becomes available.`

{{< figure src="images/network-sonarr-01.webp" title="Sonarr Server UI" link="images/network-sonarr-01.webp" >}}

### Radarr

[Radarr](https://github.com/Radarr/Radarr) is used for organising movie media and metadata such as descriptions, names, and actors. It can also be used to keep track of release dates and automate the aquisition by coordinating with an indexer and torrent client.

From their github:
`Radarr is a movie collection manager for Usenet and BitTorrent users. It can monitor multiple RSS feeds for new movies and will interface with clients and indexers to grab, sort, and rename them. It can also be configured to automatically upgrade the quality of existing files in the library when a better quality format becomes available.`

{{< figure src="images/network-radarr-01.webp" title="Radarr Server UI" link="images/network-radarr-01.webp" >}}

### Lidarr

[Lidarr](https://github.com/Lidarr/Lidarr) is used for organising music media and metadata such as descriptions, names, and artists. It can also be used to keep track of release dates and automate the aquisition by coordinating with an indexer and torrent client.

From their github:
`Lidarr is a music collection manager for Usenet and BitTorrent users. It can monitor multiple RSS feeds for new tracks from your favorite artists and will grab, sort and rename them. It can also be configured to automatically upgrade the quality of files already downloaded when a better quality format becomes available.`

{{< figure src="images/network-lidarr-01.webp" title="Lidarr Server UI" link="images/network-lidarr-01.webp" >}}

### Readarr

[Readarr](https://github.com/Readarr/Readarr) is used for organising book media and metadata such as descriptions, names, and authors. It can also be used to keep track of release dates and automate the aquisition by coordinating with an indexer and torrent client.

From their github:
`Readarr is an ebook and audiobook collection manager for Usenet and BitTorrent users. It can monitor multiple RSS feeds for new books from your favorite authors and will grab, sort and rename them. Note that only one type of a given book is supported. If you want both an audiobook and ebook of a given book you will need multiple instances.`

{{< figure src="images/network-readarr-01.webp" title="Readarr Server UI" link="images/network-readarr-01.webp" >}}

### Mylar

[Mylar](https://github.com/mylar3/mylar3) is used for organising comic media and metadata such as descriptions, names, and authors. It can also be used to keep track of release dates and automate the aquisition by coordinating with an indexer and torrent client.

Side note: The name an UI aren't consistent

From their github:
`Mylar is an automated Comic Book (cbr/cbz) downloader program for use with NZB and torrents. Mylar allows you to create a watchlist of series that it monitors for various things (new issues, updated information, etc). It will grab, sort, and rename downloaded issues. It will also allow you to monitor weekly pull-lists for items belonging to said watchlisted series to download, as well as being able to monitor and maintain story-arcs.`

{{< figure src="images/network-mylar-01.webp" title="Mylar Server UI" link="images/network-mylar-01.webp" >}}

___

## GMail & GDrive & GDocuments & GCalendar & GContacts & GMeetings & Trello

[Nextcloud](https://nextcloud.com/) is the perfect google replacement for most needs, though I am currently looking into [Mailcow](https://github.com/mailcow/mailcow-dockerized) for emails.

___
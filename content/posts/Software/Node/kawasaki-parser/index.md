---
date: 2023-02-10T10:58:08-04:00
title: "Kawasaki As Parser"
description: "Kawasaki AS backup file parser"
hero: "images/kawasaki-parser-bg.webp"
tags: ["Kawasaki","Node","Electron","Parser","HTML","JavaScript","CSS"]
categories: ["Software","Node"]
---

A Kawasaki robot backup parser written in TypeScript for browser or Node. The library also includes TypeScript interfaces for use in new projects. 

<!--more-->

___

## Source

[Github](https://github.com/rassweiler/kawasaki-as-parser)

## Usage

For node projects the library can be downloaded from [NPM](https://www.npmjs.com/package/@rassweiler/kawasaki-as-parser)

### NPM

```zsh
$ npm install @rassweiler/kawasaki-as-parser
```

### Yarn

```zsh
$ yarn add @rassweiler/kawasaki-as-parser
```

### Importing

```javascript
import KawasakiParser from "@rassweiler/kawasaki-as-parser";
```

### Getting Data

The module's functions can be called independently (All calls return promises):

```javascript
let info = await KawasakiParser.getRobotInformationObject(
	utf8StringArray,
	robotNumber
);
```

Or the `getControllerObject()` function can be called and will return an object containing all of the robot information:

```javascript
let controller = await KawasakiParser.getControllerObject(utf8StringFromAsFile);
```

## Images

{{< figure src="images/kawasaki-parser-bg.webp" title="Hot off the editing floor!" link="images/kawasaki-parser-bg.webp" >}}

___

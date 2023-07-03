---
title: 'From youtube videos to octatrack samples'
description: 'Download youtube videos and convert them to octatrack-ready samples'
date: '2019-11-17'
tags: ['Elektron Octatrack', 'music', 'scripts', 'ffmpeg']
published: true
---

I have the luck to own an Elektron Octatrack, a powerful, deep and sometimes strange sampler/sequencer. I use it to make music, and I love it.

Octatrack "optimal" sample format is wav, 44.1hHz at 24bits.

Here two small handy command aliases I use to prepare samples for octatrack. Should be improveable.

You will need to have ffmpeg installed (http://ffmpeg.org/), I also use ZSH as a shell (not sure if evereything below would work with bash).

## Process wav files in folders and subfolders, save in /converted folder

```bash
alias octaconv='f() {mkdir converted; for i in **/*.wav; do ffmpeg -i "$i" -acodec pcm_s24le -ar 44100 "converted/${i%.*}.wav"; done};f'
```

usage : just type "octaconv" from a directory containing wavefiles or a sample collection

## Download a youtube video, extract audio to wav, and save a 44100-24 bits version

```bash
alias ytdlocta='f() {youtube-dl -x --audio-format wav --exec "ffmpeg -i {} -acodec pcm_s24le -ar 44100 {}.24.wav" $1 };f'
```

usage : type `ytdlocta <youtubeId_or_URL>`

Your mileage may vary: one does not always need 24-bit files, it would only be useful if your source material has a lot of dynamics and subtleties (classical music, jazz, etc.), and if the source recording is of good quality (which is not always the case with youtube videos!).

If you want 16bits instead of 24bits (to save flex memory for example), replace `pcm_s24le` in the commands by `pcm_s16le`.

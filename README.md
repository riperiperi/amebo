amebo
=====

Frontend: http://amebo-emu.tk

amebo is a javascript Gameboy emulator (DMG/GBC). The future focus is to improve accuracy and clean up the API while maintaining solid performance on relevant devices.

## Using amebo

You can instantiate a gameboy object in the following manner:

```javascript
gameboyObj = new gb('yourROM.gb', canvas);
```

The gameboy object exposes a number of properties, but the most important ones are
```javascript
gameboyObj.paused = true; //you can pause the emulation this way
gameboyObj.reset(); //resets the console
gameboyObj.saveState(); //saves the current state into a JSON object and returns it.
gameboyObj.loadState(state); //loads the specified state.

gameboyObj.loadROM(url, pauseAfter); //used to load a ROM from an url
gameboyObj.loadROMBuffer(buffer, battery); //load a rom from an ArrayBuffer

gameboyObj.onload = func; //calls this when the ROM loads
gameboyObj.onstart = func; //calls this when the ROM starts emulating

gameboyObj.setButtonByte(b); //sets the input byte to the specified value. 
gameboyObj.prepareButtonByte(); //called internally to generate the next input. Overwrite this with something that uses the above to implement a custom input system.
```

## Features:

- DMG/CGB mode
- Heavily Optimized (no asm.js tho)
- Customizable controls
- Savestates
- Saves using localStorage
- Cycle Accurate Instruction Timings
- Realtime audio emulation using the Web Audio API
- Mobile Client: http://amebo-emu.tk/m , runs full speed on iPhone 5 and up
- RUNS POKEMON! (obviously the most important feature)

## In future:

- Instruction memory timings
- OAM bug
- Cycle accurate display timings
- Display behaviour during write to VRAM while busy
- Wave RAM bug (DMG)
- Boot w/o bios
- Super Gameboy mode
- Downsample audio from high frequency/generate antialiased waves

## IDE
In future I will also be developing a javascript gameboy IDE. It will be the best and most intuitive gbz80 assembler you have ever seen, surely. It might go in another repo.
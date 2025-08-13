export type EventTime = number; // seconds from now or relative timeline

export type NoteOnEvent = {
  type: 'noteOn';
  time: EventTime;
  instrument: 'subtractive' | 'fm' | 'sampler';
  pitch: number; // MIDI note number
  velocity: number; // 0..1
  duration: number; // seconds (hint)
};

export type NoteOffEvent = {
  type: 'noteOff';
  time: EventTime;
  pitch: number;
};

export type ParamModEvent = {
  type: 'paramMod';
  time: EventTime;
  target: 'vibrato' | 'fmDepth' | 'sustain';
  value: number; // 0..1
};

export type MappingEvent = NoteOnEvent | NoteOffEvent | ParamModEvent;


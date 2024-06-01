Toolkit

1. Select bot
2. Specify folders
3. Repetitive
4. Save prompt
5. Select prompt

N. Settings, presets

Tree of tasks? unroll task

Additional feature (in-context-of) with this scenario:
- specify goal
- specify and perform action
- start from miner



Template
const tmpl1 = "Anywhere you ${action1} I will ${action2} you";
const fn1 = new Function('action1', 'action2', `return \`${tmpl1}\``);
const res1 = fn1('go', 'follow');
console.log(res1);

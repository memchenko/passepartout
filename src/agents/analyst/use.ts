// const stream = analystAgent.stream(
//   {
//     input: answer.input,
//   },
//   {
//     recursionLimit: 1000,
//     configurable: {
//       sessionId: 'user',
//     },
//     callbacks: [
//       {
//         handleAgentAction: handleAgentAction.bind(null, 'analyst'),
//         handleAgentEnd() {
//           process.stdout.write('\n---------------\n');
//           process.stdout.write('ANALYST AGENT END\n');
//           // process.exit(0);
//         },
//       },
//     ],
//   },
// );

// for await (const chunk of await stream) {
//   if (chunk.content) {
//     process.stdout.write(chunk.content);
//   }
// }

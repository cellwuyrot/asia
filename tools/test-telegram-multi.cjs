const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const ts = require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript');
const base = path.join(__dirname, '../packages/web/src');
let checked = 0;
for (const file of ['shared/orders.ts', 'api/services/orders.ts', 'api/routes/orders.ts', 'api/services/order-notifications.ts', 'web/components/admin-orders.tsx']) {
  const content = fs.readFileSync(path.join(base,file), 'utf8');
  const result = ts.transpileModule(content, { fileName:file, reportDiagnostics:true, compilerOptions:{module:ts.ModuleKind.CommonJS, jsx:ts.JsxEmit.ReactJSX}});
  const errors=(result.diagnostics||[]).filter(d=>d.category === ts.DiagnosticCategory.Error);
  assert.equal(errors.length,0, `${file}: ${errors.map(x=>x.messageText).join(',')}`);
  checked++;
}
const src=fs.readFileSync(path.join(base,'api/services/orders.ts'),'utf8');
const from=src.indexOf('export function telegramRecipients('), to=src.indexOf('export const tokenConfigured',from);
assert(from>=0&&to>from);
const snippet=src.slice(from,to).replace('export ','').replace('export ','').replace(/: \{ chatId: string; chatIds: string\[\] \}/,'').replace(/: string\[\]/g,'').replace(/: string/g,'').replace(/: Promise<[^>]+>/g,'');
// Exercise the exact extracted implementation, transpiled from its TypeScript declarations.
const compiled=ts.transpileModule(src.slice(from,to),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const sent=[];let rejectId='';
const env={exports:{},sendTelegram: async(id,txt)=>{sent.push([id,txt]);if(id===rejectId)throw Error('denied');},Set,Promise,Error};
vm.runInNewContext(compiled,env);
const ids=env.exports.telegramRecipients({chatId:'111',chatIds:['222','111',' 333 ','222']});
assert.equal(JSON.stringify(ids),JSON.stringify(['222','111','333']));
checked++;
(async()=>{
 await env.exports.sendTelegramToManagers(ids,'test'); assert.equal(sent.length,3);checked++;
 sent.length=0; rejectId='222';
 await assert.rejects(env.exports.sendTelegramToManagers(ids,'test'),/не доставлено 1 из 3/);
 assert.equal(sent.length,3); checked++;
 assert.equal(env.exports.telegramRecipients({chatId:'',chatIds:[]}).length,0);checked++;
 console.log(`PASS: ${checked} tests (5 syntax/transpile, de-duplication, successful fanout, isolated failure, empty list)`);
})().catch(e=>{console.error(e);process.exitCode=1});

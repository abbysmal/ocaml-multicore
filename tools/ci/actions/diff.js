const { promisify } = require('util');
const exec = promisify(require('child_process').exec)

let CURRENT_BRANCH_POINT = '6e053e0dbba91a7c6ca1aad98f1b46557d319493'

let diff_cmd = 'git diff --minimal --numstat';

async function get_diff(cmd) {
    try {
	console.log(cmd);
	const {stdout, stderr} = await exec(cmd);
	console.log({stdout, stderr});
	let res = stdout === "" ? "0\t0\t\0\n" : stdout; // no change in git diff returns nada
	let s = res.replace("\n", "").split("\t");
	console.log(s);
	return(stdout);
    }
    catch (e) {
	return undefined;
    }
}

async function getChangedFiles (base, head) {
    let changed_cmd = 'git diff --name-only HEAD ${base} ${head}';
    const {stdout, stderr} = await exec(changed_cmd);
    return (stdout.split("\n"));
};

async function main(github, context) {
    let base = github.base_ref;
    let head = github.head_ref;

    var message = "🐪 Multicore diff bot\n\n";

    let changed = await getChangedFiles(base, head);
    console.log(changed);
    changed.pop(); // extra \n

    let changed_files = changed.join(' ');

    let beforeArg = ' ${CURRENT_BRANCH_POINT} ${base} -- ${changed_files}';
    let afterArg = ' ${CURRENT_BRANCH_POINT} ${head} -- ${changed_files}';
    let beforeCmd = diff_cmd.concat(beforeArg);
    let afterCmd = diff_cmd.concat(afterArg);
    let before = await get_diff(beforeCmd);
    let after = await get_diff(afterCmd);

    let diff_message = `
Before this PR
\`\`\`diff
${before}
\`\`\`
After this PR
\`\`\`diff
${after}
\`\`\`
`;
    message = message.concat(diff_message);
    // for (const i of changed) {
	// prelude
// 	message = message.concat(`### ${i}
// | Compared to trunk | 4.12+domains+effects | This branch |
// |-|-|-|
// `);
// 	let BeforeCmd = diff_cmd.concat(` ocaml/trunk origin/4.12+domains+effects ${i}`);
// 	let trunkCmd = diff_cmd.concat(` ocaml/trunk ${i}`);
// 	let fromMulticore = await get_diff(multicoreCmd);
// 	let fromTrunk = await get_diff(trunkCmd);

// 	if (fromTrunk != undefined && fromMulticore != undefined) {

// 	    let trunkAdded = parseInt(fromTrunk[0]);
// 	    let trunkRemoved = parseInt(fromTrunk[1]);
// 	    let multicoreAdded = parseInt(fromMulticore[0]);
// 	    let multicoreRemoved = parseInt(fromMulticore[1]);
// 	    let trunkScore = trunkAdded + trunkRemoved;
// 	    let multicoreScore = multicoreAdded + multicoreRemoved;

// 	    totalScoreTrunk = totalScoreTrunk + trunkScore;
// 	    totalScoreMulticore = totalScoreMulticore + multicoreScore;

// 		let table =
// `|Added |${multicoreAdded}|${trunkAdded}|
// |Removed |${multicoreRemoved}|${trunkRemoved}|
// |Score |${multicoreScore}|${trunkScore}|

// `;
// 	        let diff = await exec(`git diff HEAD ocaml/trunk -- ${i}`);
// 	    let d = diff.stdout.split("~").join("");
//                 let diff_message = `
// <details>

// <summary> Diff for ${i} against trunk </summary>

// \`\`\`diff
// ${d}
// \`\`\`

// </details>

// `;
// 		console.log(diff_message);
// 		console.log(table);
// 	        message = message.concat(table + diff_message);
// 	}
//     }
//     message = message.concat(`Total score for the files changed in this PR: ${totalScoreTrunk}
// Total score for the files changed in this PR, relative to Multicore: ${totalScoreMulticore}

// Evaluation: `);

    return await github.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: message
    })
}

module.exports = ({github, context}) => {
    return main(github, context);
}

const { promisify } = require('util');
const exec = promisify(require('child_process').exec)

let CURRENT_BRANCH_POINT = '6e053e0dbba91a7c6ca1aad98f1b46557d319493'

let diff_cmd = 'git diff --stat';

async function get_diff(cmd) {
    try {
	console.log(cmd);
	const {stdout, stderr} = await exec(cmd);
	console.log({stdout, stderr});
	return(stdout);
    }
    catch (e) {
	return undefined;
    }
}

async function getChangedFiles () {
    let changed_cmd = `git diff --name-only origin/5.00 HEAD`;
    const {stdout, stderr} = await exec(changed_cmd);
    console.log(stdout);
    console.log(stderr);
    return (stdout.split("\n"));
};

async function main(github, context) {

    var message = "🐪 Multicore diff bot\n\n";

    let fetch = await exec('git fetch origin 5.00');
    console.log(fetch);
    const {stdout, stderr } = await exec('git branch');
    console.log(stdout);
    console.log(stderr);

    let changed = await getChangedFiles();
    console.log(changed);
    changed.pop(); // extra \n

    let changed_files = changed.join(' ');

    let beforeArg = ` ${CURRENT_BRANCH_POINT} origin/5.00 -- ${changed_files}`;
    let afterArg = ` ${CURRENT_BRANCH_POINT} HEAD -- ${changed_files}`;
    let beforeCmd = diff_cmd.concat(beforeArg);
    let afterCmd = diff_cmd.concat(afterArg);
    let before = await get_diff(beforeCmd);
    let after = await get_diff(afterCmd);

    let diff_message = `
Before this PR
\`\`\`diff
${beforeCmd}
${before}
\`\`\`
After this PR
\`\`\`diff
${afterCmd}
${after}
\`\`\`
`;
    message = message.concat(diff_message);

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

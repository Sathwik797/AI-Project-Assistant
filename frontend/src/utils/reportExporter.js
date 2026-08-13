/**
 * Generates and downloads a structured Markdown Project Intelligence Brief.
 */
export function exportProjectReport({ project, requirements = [], stories = [], tasks = [], conflicts = [] }) {
  const timestamp = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  let content = `# ${project?.name || 'Project'} — Intelligence & Requirements Brief\n`;
  content += `**Generated Date:** ${timestamp}\n`;
  content += `**Description:** ${project?.description || 'No description provided.'}\n\n`;
  content += `---\n\n`;

  // 1. Requirements Matrix
  content += `## 1. Requirements Matrix (${requirements.length})\n\n`;
  if (requirements.length === 0) {
    content += `*No requirements logged.*\n\n`;
  } else {
    content += `| Code | Requirement Title | Type | Priority | Status |\n`;
    content += `|---|---|---|---|---|\n`;
    requirements.forEach((r) => {
      content += `| \`${r.req_code}\` | ${r.title} | ${r.req_type} | ${r.priority} | ${r.status} |\n`;
    });
    content += `\n`;
  }

  // 2. User Stories
  content += `## 2. Agile User Stories (${stories.length})\n\n`;
  if (stories.length === 0) {
    content += `*No user stories logged.*\n\n`;
  } else {
    stories.forEach((s) => {
      content += `### ${s.story_code}: ${s.title}\n`;
      content += `- **As a** ${s.user_role}\n`;
      content += `- **I want** ${s.goal}\n`;
      content += `- **So that** ${s.benefit}\n`;
      if (s.acceptance_criteria) {
        content += `- **Acceptance Criteria:** ${s.acceptance_criteria}\n`;
      }
      content += `\n`;
    });
  }

  // 3. Technical Tasks
  content += `## 3. Engineering Technical Tasks (${tasks.length})\n\n`;
  if (tasks.length === 0) {
    content += `*No technical tasks logged.*\n\n`;
  } else {
    content += `| Code | Task Title | Priority | Status | Assignee |\n`;
    content += `|---|---|---|---|---|\n`;
    tasks.forEach((t) => {
      content += `| \`${t.task_code}\` | ${t.title} | ${t.priority} | ${t.status} | ${t.assignee} |\n`;
    });
    content += `\n`;
  }

  // 4. Requirement Conflicts
  content += `## 4. Detected Conflicts & Ambiguities (${conflicts.length})\n\n`;
  if (conflicts.length === 0) {
    content += `*No requirement conflicts detected.*\n\n`;
  } else {
    conflicts.forEach((c) => {
      content += `### ⚠️ ${c.title} (${c.severity} Severity)\n`;
      content += `${c.description}\n\n`;
      if (c.resolution) {
        content += `**Suggested Resolution:** ${c.resolution}\n\n`;
      }
    });
  }

  content += `---\n*Generated automatically by AI Project Assistant*\n`;

  // Trigger Download
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const filename = `${(project?.name || 'project').toLowerCase().replace(/\s+/g, '_')}_brief.md`;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

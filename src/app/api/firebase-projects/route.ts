import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

interface FirebaseProject {
  projectId: string;
  displayName: string;
  projectNumber: string;
  state: string;
}

interface FirebaseProjectsResponse {
  result: FirebaseProject[];
}

export async function GET() {
  try {
    // Firebase CLIがインストールされているかチェック
    try {
      await execAsync('firebase --version');
    } catch {
      return NextResponse.json(
        {
          error:
            'Firebase CLI is not installed. Please install it with: npm install -g firebase-tools',
        },
        { status: 400 }
      );
    }

    // Firebase CLIにログインしているかチェック
    try {
      await execAsync('firebase projects:list');
    } catch {
      return NextResponse.json(
        { error: 'Firebase CLI is not logged in. Please run: firebase login' },
        { status: 400 }
      );
    }

    // プロジェクト一覧を取得
    const { stdout: projectsOutput } = await execAsync(
      'firebase projects:list --json'
    );

    if (!projectsOutput.trim()) {
      return NextResponse.json(
        { error: 'No projects found or failed to fetch projects' },
        { status: 404 }
      );
    }

    const projects: FirebaseProjectsResponse = JSON.parse(projectsOutput);

    if (!projects.result || !Array.isArray(projects.result)) {
      return NextResponse.json(
        { error: 'Invalid response format from Firebase CLI' },
        { status: 500 }
      );
    }

    const formattedProjects = projects.result.map(
      (project: FirebaseProject) => ({
        projectId: project.projectId,
        displayName: project.displayName,
        projectNumber: project.projectNumber,
        state: project.state,
      })
    );

    return NextResponse.json({
      projects: formattedProjects,
      total: formattedProjects.length,
    });
  } catch (error) {
    console.error('Error fetching Firebase projects:', error);
    return NextResponse.json(
      {
        error:
          'Failed to fetch Firebase projects. Please check your Firebase CLI configuration.',
      },
      { status: 500 }
    );
  }
}

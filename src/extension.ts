'use strict';

import * as vscode from 'vscode';
import { AngularComponentsProvider } from './angular-view';
import { componentPath, validFile } from './util/common';
import { changeConfigurationHandler, getConfig } from './util/config';

let ignoreChange = false;

export function activate(context: vscode.ExtensionContext) {
  console.log('Angular Components Activated');
  const provider = new AngularComponentsProvider(context);
  context.subscriptions.push(
    vscode.commands.registerCommand('angular.componentView', showComponentFiles),
    vscode.window.registerTreeDataProvider('angularComponents', provider),
    vscode.window.onDidChangeActiveTextEditor(changeActiveEditorHandler),
    vscode.workspace.onDidChangeConfiguration(changeConfigurationHandler)
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}

// This function will open corresponding html and/or css files when activating a typescript component file
async function changeActiveEditorHandler(e: vscode.TextEditor | undefined) {
  if (ignoreChange || !e || !e.viewColumn || e.document.languageId !== 'typescript' || !validFile(e.document.fileName))
    return;

  const config = getConfig();
  const col = config.order[e.document.languageId]; // will always be typescript
  if (!col || !config.automatic) return;

  ignoreChange = true;
  try {
    const path = componentPath(e.document.fileName);
    await showComponentFiles(path, config);
  } catch (e) {
    console.log(e);
  } finally {
    ignoreChange = false;
  }
}

// Opens component files with the path
async function showComponentFiles(path?: string, config = getConfig()) {
  if (!path) return;
  const types = config.getPropertiesArray();
  for (const type of types) {
    for (const ext of type.exts) {
      const uri = vscode.Uri.file(`${path}.component.${ext}`);
      vscode.window.activeTextEditor && vscode.window.activeTextEditor.document.uri.fsPath === uri.fsPath
        ? await moveActiveEditor(type.i)
        : await showEditor(uri, type.i, config.preview);
    }
  }
}

function showEditor(uri: vscode.Uri, viewColumn: number, preview: boolean) {
  if (!viewColumn) return Promise.resolve();
  const options = { preserveFocus: true, viewColumn: viewColumn, preview: preview };
  return vscode.window.showTextDocument(uri, options).then(undefined, err => null); // Ignore error
}

function moveActiveEditor(viewColumn: number) {
  return vscode.commands.executeCommand('moveActiveEditor', { to: 'position', by: 'group', value: viewColumn });
}

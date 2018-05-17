import * as path from 'path';
import * as vscode from 'vscode';
import { componentName, componentPath } from './util/common';

export class AngularComponentsProvider implements vscode.TreeDataProvider<Component> {
  private _onDidChangeTreeData = new vscode.EventEmitter<Component | undefined>();
  readonly onDidChangeTreeData: vscode.Event<Component | undefined> = this._onDidChangeTreeData.event;

  constructor(context: vscode.ExtensionContext) {
    const watcher = vscode.workspace.createFileSystemWatcher('**/app/**/*.component.{html,ts,css,scss,sass,less}');
    context.subscriptions.push(
      watcher,
      watcher.onDidChange(() => this.refresh()),
      watcher.onDidCreate(() => this.refresh()),
      watcher.onDidDelete(() => this.refresh())
    );
  }

  refresh() {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: Component): Component {
    return element;
  }

  getChildren(element?: Component): Thenable<Component[]> {
    if (element) return Promise.resolve([]);
    return new Promise((resolve, reject) => {
      vscode.workspace.findFiles('**/app/**/*.component.ts', '**/node_modules/**').then(
        uris => {
          const components = uris
            .map(x => ({ path: componentPath(x.fsPath), name: componentName(x.fsPath) }))
            .filter(x => !!x.name)
            .sort((a, b) => (<string>a.name).localeCompare(<string>b.name))
            .map(
              x =>
                new Component(<string>x.name, vscode.TreeItemCollapsibleState.None, {
                  title: 'View component files',
                  command: 'angular.componentView',
                  arguments: [x.path]
                })
            );
          resolve(components);
        },
        err => reject(err)
      );
    });
  }
}

class Component extends vscode.TreeItem {
  iconPath = path.join(__filename, '..', '..', 'angular.png');

  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command: vscode.Command
  ) {
    super(label, collapsibleState);
  }
}

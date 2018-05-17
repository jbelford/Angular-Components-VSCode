'use strict';

import * as vscode from 'vscode';

let config: Config;

class Config {
  public readonly order: {
    typescript: number;
    html: number;
    css: number;
  };

  public readonly preview: boolean;

  public readonly automatic: boolean;

  constructor() {
    this.automatic = !!vscode.workspace.getConfiguration('angular').get<boolean>('automatic');
    const preview = vscode.workspace.getConfiguration('angular').get<boolean>('preview');
    this.preview = preview === undefined ? true : preview;
    const order = vscode.workspace.getConfiguration('angular').get<string>('order') || 'typescript html css';
    const split = order.split(/\s+/g);
    this.order = {
      typescript: split.indexOf('typescript') + 1,
      html: split.indexOf('html') + 1,
      css: split.indexOf('css') + 1
    };
  }

  getPropertiesArray() {
    const array = [
      { i: this.order.typescript, exts: ['ts'] },
      { i: this.order.html, exts: ['html'] },
      { i: this.order.css, exts: ['css', 'scss', 'sass', 'less'] }
    ];
    return array.sort((a, b) => a.i - b.i);
  }
}

export function getConfig() {
  if (config) return config;
  return (config = new Config());
}

export function changeConfigurationHandler(e: vscode.ConfigurationChangeEvent) {
  if (!config || !e.affectsConfiguration('angular')) return;
  config = new Config();
}

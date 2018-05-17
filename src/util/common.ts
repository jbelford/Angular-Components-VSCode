const fileReg = /\.component\.(html|css|scss|sass|less|ts)(.git)?$/;
const nameReg = /([^\\\/]+)\.component\.(html|css|scss|sass|less|ts)(.git)?$/;

export function validFile(filename: string) {
  return !!filename.match(fileReg);
}

export function componentPath(filename: string) {
  return filename.replace(fileReg, '');
}

export function componentName(path: string) {
  const match = path.match(nameReg);
  if (!match) return null;
  return match[1];
}

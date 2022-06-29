"use strict"

var fs = require("fs");
var path = require("path");

const read = async (path, params) => {
  var fullPath = FILE_PREFIX + path
  if (validatePath(fullPath)) {
    if (fs.existsSync(fullPath)) {
      var stat = fs.lstatSync(fullPath)
      if (stat.isDirectory()) {
        var fileOrderBy = params && params[FileOrderBy.Tag] || FileOrderBy.FileName
        var fileOrderByDirection = params && params[FileOrderByDirection.Tag] || FileOrderByDirection.Ascending
        var dirList = fs.readdirSync(fullPath).map(name => ({ name: name, stat: fs.lstatSync(fullPath + '/' + name) }));
        dirList.sort(buildCmp(fileOrderBy, fileOrderByDirection));
        return { isDirectory: true, files: dirList.map(info => info.name) }
      } else if (stat.isFile()) {
        return fs.readFileSync(fullPath, 'binary')
      }
    }
  }
}

const create = async (path, ctx) => {
  var fullPath = FILE_PREFIX + path
  if (validatePath(fullPath)) {
    if (!fs.existsSync(fullPath)) {
      try {
        ensureDirectoryExistence(fullPath)
        if (fullPath.charAt(fullPath.length - 1) === '/') {
          fs.mkdir(fullpath)
        } else {
          fs.writeFileSync(fullPath, Buffer.from(ctx));
        }

        return true;
      } catch (err) {
        console.log(err)
      }
    }
  }
  return false;
}

const update = async (path, ctx) => {
  var fullPath = FILE_PREFIX + path
  if (validatePath(fullPath)) {
    if (fs.existsSync(fullPath)) {
      var stat = fs.lstatSync(fullPath)
      if (!stat.isDirectory()) {
        try {
          fs.writeFileSync(fullPath, Buffer.from(ctx));
          return true;
        } catch (err) {
          console.log(err)
        }
      }
    }
  }
  return false;
}

const remove = async (path) => {
  var fullPath = FILE_PREFIX + path
  if (validatePath(fullPath)) {
    if (fs.existsSync(fullPath)) {
      var stat = fs.lstatSync(fullPath)
      if (!stat.isDirectory()) {
        try {
          fs.unlinkSync(fullPath)
          return true;
        } catch (err) {
          console.log(err)
        }
      }
    }
  }
  return false;
}

module.exports = { read, create, update, remove }

// ==================================================
const FILE_PREFIX = process.env.STORAGE_PATH

const FileOrderBy = {
  LastModified: 'lastModified', Size: 'size', FileName: 'fileName',
  Tag: 'orderBy'
}

const FileOrderByDirection = {
  Descending: 'descending', Ascending: 'ascending',
  Tag: 'orderByDirection'
}

const buildCmp = (fileOrderBy, fileOrderByDirection) => {
  var isDesc = fileOrderByDirection == FileOrderByDirection.Descending
  var build = (getter) => (lhs, rhs) => {
    if (getter(lhs) < getter(rhs)) return isDesc ? 1 : -1;
    if (getter(lhs) > getter(rhs)) return isDesc ? -1 : 1;
    return 0;
  }
  switch (fileOrderBy) {
    case FileOrderBy.LastModified:
      return build(o => o.stat.mtime);
    case FileOrderBy.Size:
      return build(o => o.stat.size);
  }
  return build(o => o.name);
}

const validatePath = (path) => {
  return !path.includes('.')
}

const ensureDirectoryExistence = (filePath) => {
  var dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

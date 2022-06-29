"use strict"

const chai = require('chai')
const chaiHttp = require('chai-http')
const assert = require('assert');
const fs = require("fs");
const app = require('../src/server.js')

chai.should()
chai.use(chaiHttp)

const FILE_PREFIX = process.env.STORAGE_PATH

describe('api file', () => {
  var testFilesDir = FILE_PREFIX + 'test/'
  before(() => {
    if (!fs.existsSync(testFilesDir)) {
      fs.mkdirSync(testFilesDir)
    } else {
      fs.rmSync(testFilesDir + '*', { recursive: true, force: true });
    }
  })
  it('get single', () => {
    fs.writeFileSync(testFilesDir + 'filename', "content")
    return chai.request(app)
      .get('/file/test/filename')
      .then(res => {
        res.should.have.status(200)
        assert.equal(res.text, 'content')
      })
      .catch(err => {
        console.log(err)
      })
      .finally(() => {
        fs.rmSync(testFilesDir + 'filename');
      })
  })
  it('get directory', () => {
    fs.writeFileSync(testFilesDir + 'filename2', "content2")
    fs.writeFileSync(testFilesDir + 'filename1', "content1")
    return chai.request(app)
      .get('/file/test')
      .then(res => {
        res.should.have.status(200)
        assert.equal(res.body.isDirectory, true)
        assert.equal(res.body.files[0], 'filename1')
        assert.equal(res.body.files[1], 'filename2')
      })
      .catch(err => {
        throw err
      })
      .finally(() => {
        fs.rmSync(testFilesDir + 'filename1');
        fs.rmSync(testFilesDir + 'filename2');
      })
  })
  it('get directory in descending order', () => {
    fs.writeFileSync(testFilesDir + 'filename2', "content2")
    fs.writeFileSync(testFilesDir + 'filename1', "content1")
    return chai.request(app)
      .get('/file/test')
      .query({ orderByDirection: 'descending' })
      .then(res => {
        res.should.have.status(200)
        assert.equal(res.body.isDirectory, true)
        assert.equal(res.body.files[0], 'filename2')
        assert.equal(res.body.files[1], 'filename1')
      })
      .catch(err => {
        throw err
      })
      .finally(() => {
        fs.rmSync(testFilesDir + 'filename1');
        fs.rmSync(testFilesDir + 'filename2');
      })
  })
  it('get directory sort by modifiedTime', async () => {
    fs.writeFileSync(testFilesDir + 'filename2', "content2")
    await new Promise(resolve => setTimeout(resolve, 1)); // sleep for 1 ms
    fs.writeFileSync(testFilesDir + 'filename1', "content1")
    return chai.request(app)
      .get('/file/test')
      .query({ orderBy: 'lastModified' })
      .then(res => {
        res.should.have.status(200)
        assert.equal(res.body.isDirectory, true)
        assert.equal(res.body.files[0], 'filename2')
        assert.equal(res.body.files[1], 'filename1')
      })
      .catch(err => {
        throw err
      })
      .finally(() => {
        fs.rmSync(testFilesDir + 'filename1');
        fs.rmSync(testFilesDir + 'filename2');
      })
  })
  it('get directory sort by size', () => {
    fs.writeFileSync(testFilesDir + 'filename2', "content")
    fs.writeFileSync(testFilesDir + 'filename1', "contentcontent")
    return chai.request(app)
      .get('/file/test')
      .query({ orderBy: 'size' })
      .then(res => {
        res.should.have.status(200)
        assert.equal(res.body.isDirectory, true)
        assert.equal(res.body.files[0], 'filename2')
        assert.equal(res.body.files[1], 'filename1')
      })
      .catch(err => {
        throw err
      })
      .finally(() => {
        fs.rmSync(testFilesDir + 'filename1');
        fs.rmSync(testFilesDir + 'filename2');
      })
  })
  it('create file', () => {
    return chai.request(app)
      .post('/file/test/filename')
      .type('form')
      .send({ file: Buffer.from('content') })
      .then(res => {
        res.should.have.status(200)
        var content = fs.readFileSync(testFilesDir + 'filename')
        assert.equal(content, 'content')
      })
      .catch(err => {
        throw err
      })
      .finally(() => {
        fs.rmSync(testFilesDir + 'filename')
      })
  })
  it('create file fail if exist', () => {
    fs.writeFileSync(testFilesDir + 'filename', "content")
    return chai.request(app)
      .post('/file/test/filename')
      .type('form')
      .send({ file: Buffer.from('content') })
      .then(res => {
        res.should.have.status(404)
      })
      .catch(err => {
        throw err
      })
      .finally(() => {
        fs.rmSync(testFilesDir + 'filename')
      })
  })
  it('update file', () => {
    fs.writeFileSync(testFilesDir + 'filename', "content")
    return chai.request(app)
      .patch('/file/test/filename')
      .type('form')
      .send({ file: Buffer.from('updated') })
      .then(res => {
        res.should.have.status(200)
        var content = fs.readFileSync(testFilesDir + 'filename')
        assert.equal(content, 'updated')
      })
      .catch(err => {
        throw err
      })
      .finally(() => {
        fs.rmSync(testFilesDir + 'filename')
      })
  })
  it('update file fail if not exist', () => {
    return chai.request(app)
      .patch('/file/test/filename')
      .type('form')
      .send({ file: Buffer.from('content') })
      .then(res => {
        res.should.have.status(404)
      })
      .catch(err => {
        throw err
      })
  })
  it('delete file', () => {
    fs.writeFileSync(testFilesDir + 'filename', "content")
    return chai.request(app)
      .delete('/file/test/filename')
      .type('form')
      .send({ file: Buffer.from('updated') })
      .then(res => {
        res.should.have.status(200)
        assert.ok(!fs.existsSync(testFilesDir + 'filename'))
      })
      .catch(err => {
        throw err
      })
  })
  after(() => {
    fs.rmSync(testFilesDir, { recursive: true, force: true });
  })
})

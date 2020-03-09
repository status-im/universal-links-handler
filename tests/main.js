import { test } from 'zora'
import request from 'supertest'
import app from '../app'
import links from '../resources/links.json'
import assetLinks from '../resources/assetlinks.json'
import appleSiteAssociation from '../resources/apple-app-site-association.json'

const host = 'join.status.im'
const chatKey = 'e139115a1acc72510388fcf7e1cf492784c9a839888b25271465f4f1baa38c2d3997f8fd78828eb8628bc3bb55ababd884c6002d18330d59c404cc9ce3e4fb35'
const chatName = 'Lavender Trivial Goral'

const srv = request(app)

const get = (path) => (
  srv.get(path).set('Host', host)
)

test('test browser routes', t => {
  t.test('/b/ens.domains - VALID', async t => {
    const res = await get('/b/ens.domains')
    t.equal(res.statusCode, 200, 'returns 200')
    t.ok(res.text.includes(`href="http://${host}/b/ens.domains"`), 'contains link')
    t.ok(res.text.includes('Browse to ens.domains in Status'), 'contains text')
  })
})

test('test user ens routes', t => {
  t.test('/@jakubgs.eth - VALID', async t => {
    const res = await get('/@jakubgs.eth')
    t.equal(res.statusCode, 200, 'returns 200')
    t.ok(res.text.includes(`href="http://${host}/@jakubgs.eth"`), 'contains link')
    t.ok(res.text.includes('Chat and transact with <span>@jakubgs.eth</span> in Status.'), 'contains prompt')
  })

  t.test('/@jAkuBgs.eth.eth - UPPER CASE', async t => { /* we don't allow uppercase */
    const res = await get('/@jAkuBgs.eth')
    t.equal(res.statusCode, 400, 'returns 400')
    t.ok(res.text.includes('Upper case ENS names are invalid'), 'contains error')
  })
})

test('test chat key routes', t => {
  t.test(`/0x04${chatKey.substr(0,8)}... - VALID`, async t => {
    const res = await get(`/0x04${chatKey}`)
    t.equal(res.statusCode, 200, 'returns 200')
    t.ok(res.text.includes(`href="http://${host}/0x04${chatKey}"`), 'contains link')
    t.ok(res.text.includes(`Chat and transact with <span>0x04${chatKey}</span> in Status.`), 'contains prompt')
    t.ok(res.text.includes(chatName), 'contains chat name')
  })

  t.test(`/0x04${chatKey.substr(0,8).toUpperCase()}... - LOWER CASE`, async t => { /* convert upper to lowe case */
    const res = await get(`/0x04${chatKey.toUpperCase()}`)
    t.equal(res.statusCode, 200, 'returns 200')
    t.ok(res.text.includes(`href="http://${host}/0x04${chatKey}"`), 'contains link')
    t.ok(res.text.includes(`Chat and transact with <span>0x04${chatKey}</span> in Status.`), 'contains prompt')
    t.ok(res.text.includes(chatName), 'contains chat name')
  })

  t.test(`/0x04${chatKey.substr(0,8)}...abc - TOO LONG`, async t => { /* error on too long chat key */
    const res = await get(`/0x04${chatKey}abc`)
    t.equal(res.statusCode, 400, 'returns 400')
    t.ok(res.text.includes('Incorrect length of chat key'), 'contains error')
  })

  t.test(`/0x04${chatKey.substr(0,8)}... - TOO SHORT`, async t => { /* error on too short chat key */
    const res = await get(`/0x04${chatKey.substr(0,127)}`)
    t.equal(res.statusCode, 400, 'returns 400')
    t.ok(res.text.includes('Incorrect length of chat key'), 'contains error')
  })
})

test('test public channel routes', t => {
  t.test('/status-test - VALID', async t => {
    const res = await get('/status-test')
    t.equal(res.statusCode, 200, 'returns 200')
    t.ok(res.text.includes(`href="http://${host}/status-test"`), 'contains link')
    t.ok(res.text.includes('Join public channel <span>#status-test</span> on Status.'), 'contains prompt')
  })

  t.test('/staTus-TesT - UPPER CASE', async t => { /* we don't allow uppercase */
    const res = await get('/staTus-TesT')
    t.equal(res.statusCode, 302, 'returns 302')
    t.ok(res.headers['location'], '/status-test', 'redirects to lowercase')
  })
})

test('test other routes', t => {
  t.test('/health', async t => {
    const res = await get('/health')
    t.equal(res.statusCode, 200, 'returns 200')
    t.equal(res.text, 'OK', 'returns OK')
  })

  t.test('/.well-known/assetlinks.json', async t => {
    const res = await get('/.well-known/assetlinks.json')
    t.equal(res.statusCode, 200, 'returns 200')
    t.equal(res.text, JSON.stringify(assetLinks), 'returns asset links')
  })

  t.test('/.well-known/apple-app-site-association', async t => {
    const res = await get('/.well-known/apple-app-site-association')
    t.equal(res.statusCode, 200, 'returns 200')
    t.equal(res.text, JSON.stringify(appleSiteAssociation), 'returns apple association')
  })
})

test('catch-all route', t => {
  t.test('redirects to status.im', async t => {
    const res = await get('/')
    t.equal(res.statusCode, 302, 'returns 302')
    t.equal(res.headers.location, links.getStatus, 'sets location')
  })

  t.test('redirects to play store', async t => {
    const res = await get('/').set('user-agent', 'xyz Android xyz')
    t.equal(res.statusCode, 302, 'returns 302')
    t.equal(res.headers.location, links.playStore, 'sets location')
  })

  t.test('redirects to apple store', async t => {
    const res = await get('/').set('user-agent', 'xyz iPhone xyz')
    t.equal(res.statusCode, 302, 'returns 302')
    t.equal(res.headers.location, links.appleStore, 'sets location')
  })
})

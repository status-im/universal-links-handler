import { test } from 'zora'
import cheerio from 'cheerio'
import request from 'supertest'
import app from '../app'
import links from '../resources/links.json'
import assetLinks from '../resources/assetlinks.json'
import appleSiteAssociation from '../resources/apple-app-site-association.json'

const host = 'join.status.im'
const chatKey = 'e139115a1acc72510388fcf7e1cf492784c9a839888b25271465f4f1baa38c2d3997f8fd78828eb8628bc3bb55ababd884c6002d18330d59c404cc9ce3e4fb35'
const multibaseKey = 'fe70103e139115a1acc72510388fcf7e1cf492784c9a839888b25271465f4f1baa38c2d'
const compressedKey = 'zQ3shuoHL7WZEfKdexM6EyDRDhXBgcKz5SVw79stVMpmeyUvG'
const chatName = 'Lavender Trivial Goral'

const srv = request(app)

const get = (path) => (
  srv.get(path).set('Host', host)
)

/* helpers for querying returned HTML */
const q = (res, query) => cheerio.load(res.text)(query)
const html = (res, query) => (cheerio.load(res.text)(query).html() || "").trim()
const meta = (res, name) => q(res, `meta[property="${name}"]`).attr('content')

test('test browser routes', t => {
  t.test('/b/ens.domains - VALID', async t => {
    const res = await get('/b/ens.domains')
    t.eq(res.statusCode, 200, 'returns 200')
    t.eq(meta(res, 'status-im:target'), 'ens.domains', 'contains target')
    t.eq(meta(res, 'al:ios:url'), 'status-im://b/ens.domains', 'contains ios url')
    t.eq(meta(res, 'al:android:url'), 'status-im://b/ens.domains', 'contains android url')
    t.eq(html(res, 'div#info'), 'Browse to ens.domains in Status', 'contains prompt')
  })

  t.test('/b/<script>fail;</script> - XSS', async t => {
    const res = await get('/b/<script>fail;</script>')
    t.eq(res.statusCode, 400, 'returns 400')
    t.eq(html(res, 'h3#header'), 'Invalid input format', 'contains warning')
    t.eq(html(res, 'code#error'), 'Input contains HTML: &lt;script&gt;fail;&lt;/script&gt;', 'contains error')
  })

  t.test('/b/google.com/<script>fail;</script> - XSS', async t => {
    const res = await get('/b/google.com/<script>fail;</script>')
    t.eq(res.statusCode, 400, 'returns 400')
    t.eq(html(res, 'h3#header'), 'Invalid input format', 'contains warning')
    t.eq(html(res, 'code#error'), 'Input contains HTML: google.com/&lt;script&gt;fail;&lt;/script&gt;', 'contains error')
  })
})

test('test user ens routes', t => {
  t.test('/u/jakubgs.eth - VALID', async t => {
    const res = await get('/u/jakubgs.eth')
    t.eq(res.statusCode, 200, 'returns 200')
    t.eq(meta(res, 'al:ios:url'), 'status-im://u/jakubgs.eth', 'contains ios url')
    t.eq(meta(res, 'al:android:url'), 'status-im://u/jakubgs.eth', 'contains android url')
    t.eq(html(res, 'div#info'), 'Chat and transact with <span class=\"inline-block align-bottom w-32 truncate\">@jakubgs.eth</span> in Status.', 'contains prompt')
  })

  t.test('/u/jAkuBgs.eth - UPPER CASE', async t => { /* we don't allow uppercase */
    const res = await get('/u/jAkuBgs.eth')
    t.eq(res.statusCode, 200, 'returns 200')
    t.eq(q(res, 'a#redirect').attr('href'), '/u/jakubgs.eth', 'lower case url')
    t.eq(html(res, 'a#redirect'), 'Redirect Me', 'redirect button')
    t.eq(html(res, 'div#info'), 'Beware of phishing attacks.', 'contains warning')
  })

  t.test('/u/<body%20onload=alert(1)//> - XSS', async t => { /* we don't allow uppercase */
    const res = await get('/u/<body%20onload=alert(1)//>')
    t.eq(res.statusCode, 400, 'returns 400')
    t.eq(html(res, 'h3#header'), 'Invalid input format', 'contains warning')
    t.eq(html(res, 'code#error'), 'Input contains HTML: /u/%3Cbody%20onload=alert(1)//%3E', 'contains error')
  })
})

test('test chat key routes', t => {
  t.test(`/u/0x04${chatKey.substr(0,8)}... - VALID`, async t => {
    const res = await get(`/u/0x04${chatKey}`)
    t.eq(res.statusCode, 200, 'returns 200')
    t.eq(meta(res, 'al:ios:url'), `status-im://u/0x04${chatKey}`, 'contains ios url')
    t.eq(meta(res, 'al:android:url'), `status-im://u/0x04${chatKey}`, 'contains android url')
    t.eq(html(res, 'div#info'), `Chat and transact with <span class=\"inline-block align-bottom w-32 truncate\">0x04${chatKey}</span> in Status.`, 'contains prompt')
    t.eq(html(res, '#header'), chatName, 'contains chat name')
  })

  t.test(`/u/0x04${chatKey.substr(0,8).toUpperCase()}... - LOWER CASE`, async t => { /* convert upper to lowe case */
    const res = await get(`/u/0x04${chatKey.toUpperCase()}`)
    t.eq(res.statusCode, 200, 'returns 200')
    t.eq(meta(res, 'al:ios:url'), `status-im://u/0x04${chatKey}`, 'contains ios url')
    t.eq(meta(res, 'al:android:url'), `status-im://u/0x04${chatKey}`, 'contains android url')
    t.eq(html(res, 'div#info'), `Chat and transact with <span class=\"inline-block align-bottom w-32 truncate\">0x04${chatKey}</span> in Status.`, 'contains prompt')
    t.eq(html(res, '#header'), chatName, 'contains chat name')
  })

  t.test(`/u/0x04${chatKey.substr(0,8)}...abc - TOO LONG`, async t => { /* error on too long chat key */
    const res = await get(`/u/0x04${chatKey}abc`)
    t.eq(res.statusCode, 400, 'returns 400')
    t.eq(html(res, 'code#error'), 'Incorrect length of chat key', 'contains error')
  })

  t.test(`/u/0x04${chatKey.substr(0,8)}... - TOO SHORT`, async t => { /* error on too short chat key */
    const res = await get(`/u/0x04${chatKey.substr(0,127)}`)
    t.eq(res.statusCode, 400, 'returns 400')
    t.eq(html(res, 'code#error'), 'Incorrect length of chat key', 'contains error')
  })
})

test('test multibase chat key routes', t => {
  t.test(`/u/${multibaseKey.substr(0,12)}... - VALID`, async t => {
    const res = await get(`/u/${multibaseKey}`)
    t.eq(res.statusCode, 200, 'returns 200')
    t.eq(meta(res, 'al:ios:url'), `status-im://u/${multibaseKey}`, 'contains ios url')
    t.eq(meta(res, 'al:android:url'), `status-im://u/${multibaseKey}`, 'contains android url')
    t.eq(html(res, 'div#info'), `Chat and transact with <span class=\"inline-block align-bottom w-32 truncate\">${multibaseKey}</span> in Status.`, 'contains prompt')
    t.eq(html(res, '#header'), chatName, 'contains chat name')
  })

  t.test(`/u/${multibaseKey.substr(0,12)}... - TOO SHORT`, async t => { /* error on too short chat key */
    const res = await get(`/u/${multibaseKey.substr(0,46)}`)
    t.eq(res.statusCode, 400, 'returns 400')
    t.eq(html(res, 'code#error'), 'Incorrect length of chat key', 'contains error')
  })
})

test('test compressed chat key routes', t => {
  t.test(`/u/${compressedKey.substr(0,12)}... - VALID`, async t => {
    const res = await get(`/u/${compressedKey}`)
    t.eq(res.statusCode, 200, 'returns 200')
    t.eq(meta(res, 'al:ios:url'), `status-im://u/${compressedKey}`, 'contains ios url')
    t.eq(meta(res, 'al:android:url'), `status-im://u/${compressedKey}`, 'contains android url')
    t.eq(html(res, 'div#info'), `Chat and transact with <span class=\"inline-block align-bottom w-32 truncate\">${compressedKey}</span> in Status.`, 'contains prompt')
    t.eq(html(res, '#header'), chatName, 'contains chat name')
  })

  t.test(`/u/${compressedKey.substr(0,12)}... - TOO SHORT`, async t => { /* error on too short chat key */
    const res = await get(`/u/${compressedKey.substr(0,46)}`)
    t.eq(res.statusCode, 400, 'returns 400')
    t.eq(html(res, 'code#error'), 'Incorrect length of chat key', 'contains error')
  })
})

test('test public channel routes', t => {
  t.test('/status-test - VALID', async t => {
    const res = await get('/status-test')
    t.eq(res.statusCode, 200, 'returns 200')
    t.eq(meta(res, 'al:ios:url'), 'status-im://status-test', 'contains ios url')
    t.eq(meta(res, 'al:android:url'), 'status-im://status-test', 'contains android url')
    t.eq(html(res, 'div#info'), 'Join public channel <span class=\"inline-block align-bottom w-32 truncate\">#status-test</span> on Status.', 'contains prompt')
  })

  t.test('/staTus-TesT - UPPER CASE', async t => { /* we don't allow uppercase */
    const res = await get('/staTus-TesT')
    t.eq(res.statusCode, 200, 'returns 200')
    t.eq(q(res, 'a#redirect').attr('href'), '/status-test', 'lower case url')
    t.eq(html(res, 'a#redirect'), 'Redirect Me', 'redirect button')
    t.eq(html(res, 'div#info'), 'Beware of phishing attacks.', 'contains warning')
  })
})

test('test other routes', t => {
  t.test('/health', async t => {
    const res = await get('/health')
    t.eq(res.statusCode, 200, 'returns 200')
    t.eq(res.text, 'OK', 'returns OK')
  })

  t.test('/.well-known/assetlinks.json', async t => {
    const res = await get('/.well-known/assetlinks.json')
    t.eq(res.statusCode, 200, 'returns 200')
    t.eq(res.text, JSON.stringify(assetLinks), 'returns asset links')
  })

  t.test('/.well-known/apple-app-site-association', async t => {
    const res = await get('/.well-known/apple-app-site-association')
    t.eq(res.statusCode, 200, 'returns 200')
    t.eq(res.text, JSON.stringify(appleSiteAssociation), 'returns apple association')
  })
})

test('catch-all route', t => {
  t.test('redirects to status.im', async t => {
    const res = await get('/')
    t.eq(res.statusCode, 302, 'returns 302')
    t.eq(res.headers.location, links.getStatus, 'sets location')
  })

  t.test('redirects to play store', async t => {
    const res = await get('/').set('user-agent', 'xyz Android xyz')
    t.eq(res.statusCode, 302, 'returns 302')
    t.eq(res.headers.location, links.playStore, 'sets location')
  })

  t.test('redirects to apple store', async t => {
    const res = await get('/').set('user-agent', 'xyz iPhone xyz')
    t.eq(res.statusCode, 302, 'returns 302')
    t.eq(res.headers.location, links.appleStore, 'sets location')
  })
})

# Embedding the Zea Svelt App in your own Web App

## Embed View

The Embed view shows how the svelte app would be displayed within the context of another application, embedded as an iFrame. The host application can then control the embedded svelte app via the JSON API and the Channel Messenger classes.

# Getting Started

To test zea-svelt-template embedded on your system, and run through the following steps.

In the root of the project, run the svelete app as normal using dev.

```sh
> npm run dev
```

With the Svelte app being server, run a static http server, in the docs directory of the project.
You may need to install a static server on your system. The http-server npm package is a good basic server.

```sh
> npm install --global http-server
```

```sh
> http-server

Starting up http-server, serving ./
Available on:
  http://192.168.2.25:8080
  http://127.0.0.1:8080
Hit CTRL-C to stop the server
```

Then open a browser at the given address.

> http://192.168.2.25:8080/embed.html

# Embedders Guide

Provided is a sample embed.html file that demonstrates how to embed Web Composer into a host application.

```javascript
<iframe id="zea-svelt-template" src="./zea-svelt-template/index.html?noframe"></iframe>

<script type="module">
  const viewer = document.getElementById('zea-svelt-template')
  import { ChannelMessenger } from './ChannelMessenger.js'

  const client = new ChannelMessenger(viewer)
  client.on('ready', (data) => {  })
</script>
```

The web app is intended to be deployed on a client companies infrastructure. This means the Web Composer web application is hosted on the same origin as the data being loaded ensuring that browser security policies are followed.

# JSON API

The Svelte app accepts a range of commands sent via the ChannelMessenger interface.

## Events

The Svelte App might emit events based on interactions within the viewer or other reasons. The host web application can listen to these events and respond.

#### Ready

The ready event is sent as soon as the zea-svelt-template frame has loaded, and the ChannelMessenger has established a connection with the page.

```javascript
client.on('ready', (data) => {
  console.log('zea-svelt-template is ready to load data')
})
```

#### selectionChanged

The selectionChanged event is sent when the selection changes in the selection manager in the app.

```javascript
client.on('selectionChanged', (data) => {
  console.log('selectionChanged:', data)
})
```

## Commands

The commands are structured in the following way.

> Command Name: The command name is a string describing which command should be invoked in the viewer.

> Payload: The payload is a json structure containing relevant information needed to process the command.

> Results: Each command returns a promise that resolves to some result returned by the zea-svelt-template

```javascript
do('command-name', payload).then((results) => {
  // process or display the results.
})
```

#### Load Project

```javascript
client
  .do('loadCADFile', {
    zcad: '../foo.zcad',
  })
  .then((data) => {
    console.log('loadCADFile Loaded', data)
  })
```

##### Payload:

zcad: the URL of the zcad accessible to the app.

##### Results:

The command returns a JavaScript object containing high level data about the loaded project.

#### Set Background Color

Sets the background color of the viewport.

> Note: this command is given to provide an example of how the viewer can be controlled. Other commands might be more relevant, and we are looking for this feedback.

```javascript
client.do('setBackgroundColor', { color: '#FF0000' })
```

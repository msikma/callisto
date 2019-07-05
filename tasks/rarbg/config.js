export const configTemplate = () => {
  const obj = `
rarbg: {
  // It's required to get cookies from the site, or the task won't work.
  // When there are no cookies, every request will return a warning
  // page stating there is "suspicious activity" from your IP.
  //
  // To get an array of cookies, simply visit the website, browse around
  // a bit, and then open the console. Type:
  //
  //    decodeURI(document.cookie).split('; ')
  //
  // Then input the result here.
  // You may need to update this every once in a while.
  cookies: [
    'aby=1',
    'tcc',
    'qxxxuxxn=qxxnxkxx',
    'skt=8IxEx5xw8s',
    'skt=8xxxx5xwxs',
    'qxxqxVxn=qxxnxkxx'
  ],
  items: [
    {
      // Get e.g. the 'slug' from the site by visiting the show's
      // information page.
      name: 'Steven Universe',
      slug: 'tt3061046',
      target: [[/* server, channel */]],
      // Add an optional icon and color to the output embed.
      icon: 'https://i.imgur.com/HyFAJHR.png',
      color: 0xff578b
    }
    // ...
  ]
}
  `
  return { obj: obj.trim() }
}

export const askAiPage = () => {
  return /*html*/`
    <!DOCTYPE html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <link rel="stylesheet" href="/css/bootstrap:dist:css:bootstrap.min">
      <script src="/js/htmx.org:dist:htmx.min"></script>
    </head>
    <html>

    <body>

    <div class="container">
      <div class="row">
      
      <h3>Ask AI!</h1>

      <input 
        type="text" class="form-control" placeholder="what do you want to ask?"
        name="question"
        hx-get="/api/ask-ai"
        hx-trigger="keyup[keyCode==13]"
        hx-target="#aiAswer"
        hx-include="[name='question']"
      >

      </div>

      <div id="aiAswer" class="row">
          
      </div>
    </div>

    </body>

    </html>
    `
}


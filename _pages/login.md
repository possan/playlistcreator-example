---
layout: default
---

<div class="container">
    <div id="login">
        <h1>This is an example of the Authorization Code flow</h1>
        <a href="/login" class="btn btn-primary">Log in with Spotify</a>
    </div>
    <div id="loggedin">
        <div id="user-profile"></div>
        <div id="oauth"></div>
        <button class="button is-success" id="obtain-new-token">Obtain new token using the refresh token</button>
    </div>
</div>

<script id="user-profile-template" type="text/x-handlebars-template">
    <h1>Logged in as {{display_name}}</h1>
    <div class="media">
        <div class="pull-left">
            <img class="media-object" width="150" src="{{images.0.url}}" />
        </div>
        <div class="media-body">
            <dl class="dl-horizontal">
              <dt>Display name</dt><dd class="clearfix">{{display_name}}</dd>
                <dt>Id</dt><dd>{{id}}</dd>
                <dt>Email</dt><dd>{{email}}</dd>
                <dt>Spotify URI</dt><dd><a href="{{external_urls.spotify}}">{{external_urls.spotify}}</a></dd>
                <dt>Link</dt><dd><a href="{{href}}">{{href}}</a></dd>
                <dt>Profile Image</dt><dd class="clearfix"><a href="{{images.0.url}}">{{images.0.url}}</a></dd>
                <dt>Country</dt><dd>{{country}}</dd>
            </dl>
        </div>
    </div>
</script>

<script id="oauth-template" type="text/x-handlebars-template">
    <h2>oAuth info</h2>
    <dl class="dl-horizontal">
        <dt>Access token</dt><dd class="text-overflow">{{access_token}}</dd>
        <dt>Refresh token</dt><dd class="text-overflow">{{refresh_token}}</dd>
    </dl>
</script>
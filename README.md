# esup-otp-manager
Manager for the esup-otp-api. Allow users to edit theirs preferences and admins to administrate ;)

### Version
1.1
- new homepage
- methods can be displayed by user profile
- random code sent by email is defined as a separate method
- remove transport for TOTP method
- confirm dialog before generate bypass codes and totp Qrcode
- confirm dialog before deactivate a method
- various code cleanup, fix, package update

### Requirements
- [esup-otp-api](https://github.com/EsupPortail/esup-otp-api)

### Installation
- git clone https://github.com/EsupPortail/esup-otp-manager.git
- npm install
- change the fields values in properties/esup.json to your installation, some explanations are in #how_to attributes
- npm start

### Behind Apache
- https 

```
RequestHeader set X-Forwarded-Proto https
RequestHeader set X-Forwarded-Port 443

RewriteEngine On

RewriteCond %{QUERY_STRING} transport=websocket [NC]
RewriteRule /(.*) ws://127.0.0.1:4000/$1 [P]


<Location />
ProxyPass http://127.0.0.1:4000/ retry=1
ProxyPassReverse http://127.0.0.1:4000/
</Location>
```

### Systemd

```
[Unit]
Description=esup-otp-manager nodejs app
Documentation=https://github.com/EsupPortail/esup-otp-manager
After=network.target

[Service]
Type=simple
User=esup
WorkingDirectory=/opt/esup-otp-manager
ExecStart=/usr/bin/node run
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

### Development


License
----

MIT
   [EsupPortail]: <https://www.esup-portail.org/>

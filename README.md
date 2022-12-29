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

### Development


License
----

MIT
   [EsupPortail]: <https://www.esup-portail.org/>

cat static/bundle.js | sed -e 's/).start;export{/);export{/g' > static/bundle_tmp.js
mv static/bundle_tmp.js static/bundle.js
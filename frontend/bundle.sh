cat build/bundle.js | sed -e 's/).start;export{/);export{/g' > build/bundle_tmp.js
mv build/bundle_tmp.js build/bundle.js
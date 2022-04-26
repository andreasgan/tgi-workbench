# Make a folder called "dist"
mkdir -p dist

# Copy the node_modules folder itself to dist/
cp -r node_modules dist/

# Copy all the files inside "public" into dist (i.e. not copying "public" itself)
cp -r public/* dist/
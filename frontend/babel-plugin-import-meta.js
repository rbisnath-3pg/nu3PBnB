module.exports = function() {
  return {
    visitor: {
      MemberExpression(path) {
        if (path.node.object.type === 'MetaProperty' && 
            path.node.object.meta.name === 'import' && 
            path.node.object.property.name === 'meta') {
          path.replaceWith({
            type: 'MemberExpression',
            object: {
              type: 'Identifier',
              name: 'global'
            },
            property: {
              type: 'Identifier',
              name: 'import'
            }
          });
        }
      }
    }
  };
}; 
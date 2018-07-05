// TODO: WRITE BABEL PLUGIN
// TODO: ???
// TODO: PROFIT

// import semver from 'semver'
// import jsx from '@babel/plugin-syntax-jsx'
// import jsx6 from 'babel-plugin-syntax-jsx'

export default ({ types: t, template, version }) => {
	return {
		name: 'ast-transform', // not required
		visitor: {
			Identifier(path) {
				path.node.name = path.node.name
					.split('')
					.reverse()
					.join('');
			}
		}
	};
};

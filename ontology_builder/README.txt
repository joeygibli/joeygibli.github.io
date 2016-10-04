Project Parmenides: computer assisted ontology builder

Required files:
1. Binary CSV where every row corresponds to an entity, each column is a category, and entries are either 0 or 1
2. CSV of corresponding category names (formatted in a single row)

Generate edges for ontology:
1. Assign input_file, name file, and desired output_file in ‘format_csv.m’
2. Run script

Run ontology builder:
1. In ‘oontology_builder.html’, on line 48, include file containing edges (output_file from previous step)
2. Run ‘python -m SimpleHTTPServer 8000’ from Terminal
3. Open http://localhost:8000/Ontology%20Builder.html in browser
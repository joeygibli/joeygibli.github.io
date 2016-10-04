% input_file: binary CSV where each row is an entity, each column is a 
%             category
% output_file: name assigned to output file
% name_file: CSV for corresponding columns, single row

input_file = 'input.csv';
output_file = 'output.csv';
name_file = 'names.csv';

names = textscan(name_file, '%s','Delimiter',',');
M = csvread(input_file);
E = generate_edges(M);
N = num2name(E, names);
generate_csv(N, output_file);

function [ E ] = generate_edges( M )
%FIND_PROB_SUBSET outputs a square matrices for subsets, similarity, and
%distance:
%   P(x,y) is probability that x is a subset of y
%   S(x,y) is similarity of x to y, Rogers&Tanimoto
%   D(x,y) is distance of x to y, Lance&Williams
%   ref: http://www.iiisci.org/journal/CV$/sci/pdfs/GS315JG.pdf

[~,w] = size(M);
P = zeros(w);
S = zeros(w);
totalInstances = sum(M);
G = double(M);

for i = 1:w
    I = G(:,i)';
    a = I * G;
    b = ~I * G;
    c = I * ~G;
    P(i,:) = a / totalInstances(i);
    S(i,:) = a ./ (a + b + c);
end
P(isnan(P)) = 0;
S(isnan(S)) = 0;
T = (P .* S) - diag(ones(1,109));

T(T < 0) = 0;
[in,out] = ind2sub(size(T), find(T > 0));
weights = T(T > 0);
E = [out,in,weights];
end


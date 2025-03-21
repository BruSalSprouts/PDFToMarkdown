xrayreports4.pdf Extracted Text: 

**Figure Captions**

Fig. 1. The \(\pi^
## Feature articles ##
**Foundations of**

**Crystallography**

ISSN 01
* [19]
An account is given of the development of the \(SHELX\) system of
innovations that have come into general use through their implementation in \(SHELX
An attempt is made to understand how a program originally designed for photographic intensity data, punched cards
for \(\mathbf{\hat{S}}\) long. \
twinned data; \(SHELXPRO\) acts as an interface for macromolecular
are often employed in pipelines for _high-throughput_ phasing. This paper could serve
* [19]
## 1 Introduction ##

It was thought that a general overview of the \(SH
earlier accounts of \(SHELX\) are scattered in the excellent series of
Mirka, 1989) that are mostly not available in computer-te
graphs on Crystallography_ (Muller _et al._, 20
to fill the gap.

The first version of \(SHELX\)
at crystallographic programs that were written in that Autocode (a sort of user-friendly
started operation there in March 1972. The program was written in a small
computers. This subset showed a curious resemblance to Titan Autocode, which had the useful
doi:10.1107/S01087673
**Figure Captions**

Fig. 1. The \(\pi^
Despite efficient programming and rather sparing use of the processing weissenberg camera data, for example,
comment statements, the code for this - for the time - comprehensive crystallographic system am
modern computer language such as Python, by making extensive use of C++ libraries and higher-
these statements would be much longer and it should be remembered that \(SHELX\
theses. This _zero-dependency_ philosophy also applies to all subsequent \(
_SHELX_ has survived for so long.

The problem of the number of
caru, providing a little fortran program (on uncompressed cards of course) to
for the Fortran variables and arrays. For the five test structures, the reflection data (
data' format involved rounding insignificant digits but, by taking advantage of the known characteristics of a sorted
amost as high as _ozlpz_ would now achieve with the same data.
very useful as long as reading punched cards was the normal form of job input, and enjoyed
One major innovation in \(SHELX\)-76 was the use of
the introduction of free-format input in Fortran, the instructions were interpreted character by character using
use Hollerith strings for this purpose). This, coupled with the extensive use of sensible
cards would need to be replaced to run the next job. At about the same time,
(Motherweil, 19/8).

A further innovation that
tion was communicated to the program by means of the coordinates of the general position, not by the
At the time \(SHELX\)-76 was introduced, most X
.
**Figure Captions**

Fig. 1. The \(\pi^
and then to PCs. Relative to a modern desktop PC with say \(SHELXS
four CPUs and 4 Gbyte memory (the computer currently used by the author for 
to fit into 32 K 16-bit words, a factor of about 
structures in a few hours of days on such a machine. Although 'overlay' techniques
refinement. To avoid having to store a large least-squares normal matrix on the disk,
small overlapping full-matrix blocks, each corresponding to a few atoms and some global parameters. The
of previous block, and the blocks were chosen differently on each pass through the atom list so that
access and made very efficient use of the limited computing resources. In fact, the final version of
there was no danger of the operating system updating itself automatically _via_ the Internet and thus
W1 33/11, USA) currently runs under windows, Linux and Mac
the open-source version of _SHELX_.

FeS4 unit
### Direct and Patterson methods for small-molecule structures ###

#### 2.3.1 ####
considerable progress in the two decades that followed the introduction of _SHELX_-
**Abstract**

The _quantitative_ quantitative quantitative quantitative quantitative quantitative quantitative quantitative quantitative quantitative
solutions. \(SHELXS\):90 introduced a novel simulated-anne
unique non-H atoms. Although several other powerful and user-friendly direct-methods programs are
larger structures and also obtain more complete solutions, \(SHELXS\) is still
atom Patterson automatically that was basically a computer implementation of a classical method of hand interpretation (S
* [114] George M. Sheldrick * A short history of
**Figure Captions**

Fig. 1. The \(\pi^
search based on the Patterson minimum function for all the search based on the Patterson minimum function for all
independent vectors involving the two atoms and their symmetry equivalents. Alternatively, a vector of known length 
used. For each position of the two atoms in the cell, the Patterson height \(
33 % of _T1_ calculated. It would be easy to find the
different starting positions by simply taking the best of a finite number of random trials each time. The
from the two atoms to a much larger number before entering the dual-space recycling. The resulting
the unknown structure of the protein cytochrome c\({}_{6}\)_
the correlation coefficient between the observed and calculated \(E\) values, it was 
heavy atom in the space group \(P2_{1}\)) into
this recycling, but this innovation, which substantially increased the size of structures that could be solved by
The direct-methods program \(SHELXD\) (Sheldrick
program _SnB_ (Miller _et al._, 1
\(SHELLXD\) and \(3nB\) was the extensive
which was never officially released, expanded the data to space group _P_1. Then
structure was found as in Fig. 1, but optimizing the correlation coefficient between \(
some cases), many starting triangles led to structure solution, but it was necessary to find the
The authorised version of the article: _SHELXC, probabilistic sampling_
unique general Patterson vector of suitable length is a potential heavy-atom to heavy-atom vector,
.
**Figure Captions**

Fig. 1. The \(\pi^
## Feature articles ##

Instead, the dual-space recycling is followed by two cycles of clusters
conjugate-gradient least-squares refinement of the occupancies of the heavy atoms. The expected number
be within 20% of the true value. Heavy-atom derivatives prepared by soaking the
in other cases, the occupancy refinement is due to compensate, at least in part, for different
_hkl2map_ graphical user interface (GUI) (Pape 
Center for Structural Genomics (JCSG), with 197 correct and no incorrect
securing was employed but, with the Patterson securing switched off, many good solutions were obtained
anomalous signals, _e.g._ in sulfur SAD experiments (Debrec
option available in \(SHELXD\) to search for disulfide units directly in the
an density-momentum methods, it works best ii the soivent content is high. The
connected regions of high fluctuation (protein _etc._) and also connected regions of
heavy-atom enantiomorph or not.

If the resolution of the native data is about
by extrapolating to a higher resolution than was actually measured. This idea apears to have been
in _SIR200X_ (Caliandro _et al
tions, e.g., and on data, by one to maximize CC, reflections that
those of missing low-order reflections, are obtained by Fourier transformation of the density-modified map
Figure 2: Dual-space recycling as used in \(SHELXD\)
atoms at atomic resolution, the remaining operations are the same for this and for the location of heavy
* [116] George M. Sheldrick * A short history of
**Figure Captions**

Fig. 1. The \(\pi^
to the heavy-atom reference phases to obtain starting values rewrite provided the opportunity to change from refinement
for the native phases. In addition, \(SHELXC\) produces useful
_SHELXC/D/E_ may be called from the command line or from
and _SHELXE_ also contain facilities for radiation-damage-induced ph
Seijo _et al._, 2006). It was
### Small-molecule refinement with \(SHEAL\) ###

For many years
crystal \(\sim\)-ray data have been refined using \(SH
proved to be too restrictive. It was necessary to produce a new version, which after about 
and then as a final version \(SHELLXL\)-97. This
## References ##

* [1] A. A. Starobinsky, _
**Figure Captions**

Fig. 1. The \(\chi^
## References ##

* [1] A. A. K. S. S.

* [19]
* [12] A. A. K. K. K. K. K
* [14]
Figure 3:
(_a_) _k_emed occupancy against peak number for \(
.
**Figure Captions**

Fig. 1. The \(\pi^
deposition), name.cf [a CIF format file containing observed these standard uncertainties. Cow
and calculated structure factors, suitable for direct input into a graphics program such as _Coot
_SHELXL_ performs full-matrix, blocked full-matrix or conjugate-gradient least
precise that a (11) with complex scattering factors. This possesses the flexibility necessary
configuration (Flack, 1983). _SHELX_
neutron data. To handle Laue data with significant anomalous scattering, a different wavelength may be assigned
with correlation matrix for all derived geometric parameters such as bond lengths, angles, torsion angles, least
equations (Konnert, 1976), which is faster and
able to illustrate the handling of disorder using constraints and restraints here with two common examples. They
constraints and restraints introduced in _STELLA_ - 70. Atom
\(p\) is a constant and \(q\) is a constant.
times \([f(-m)-1]\). For example,
the occupancies of the other as \(-s1\) (_i
Figure 10) the two-point correlator are shown in the occupancies add up to
For H-atom and restraint generation, \(SHELXL\) sets up a
bonded to the unique atoms is included in the connectivity array. In the case of disorder, PART
the parameter (at the atom the atom energy) between atoms in PART 0 (
non-zero PART numbers. If a PART number is negative, no bonds are made to symmetry
* [118] George M. Sheldrick . A short history of
**Figure Captions**

Fig. 1. The \(\pi^
Fig. 4(_a_) shows a perchlorate anion in which atoms Cl
O1 lie on a threefold axis; O2_a_ and O2_b_
and anisotropic displacement parameters of O1 and Cl. The occupancies (as understood by the
photodu be possible to refine this anion without extra restraints but, if we wish to
distances to be respectively equal:

SADI C1 O1 C1 O2

which requires defining a symmetry equivalent of O2 (atom O2_a_ in Fig
become equal by symmetry, producing a regular tetrahedron. Note that the .ins input file
number 2, which should be set to a suitable starting value for a Cl - O
tetradhedron is 1.6330 times the C1-O distance:

and again symmetry will ensure a regular tetrahedron. In Fig. 4(\(b\
restraints so that both components are restrained to be regular tetrahedra with the same dimensions, _
DFIX 21.6330 01 02 01
(the starting value of 0.7 is given on the FVAR instruction), giving
* [1] ---- ---- ---- ---- ---- ---- ----
FAR1 Z

O1' ......... ... -30.3
The extension to allow two different Cl-atom sites is straightforward. If these sites are very close
would be necessary to sustain (e.g. \(\sim\) 
ecule on an inversion centre, a common misadventure. We need to set all
.
**Figure Captions**

Fig. 1. The \(\pi^
when the reflection overlap is not too severe, such twins The program \(SHELX
actually have the advantage that more reflections can be measured in the same time, so the resulting
The program \(CIFTAB\) was distributed as part of \(
and because at the time few programs were available that could read CIF files. These days such padding
redundant. It is however essential to archive the final .res file from a _SH
recreate a \(SHELXL\) refinement job including all the necessary rest
### Macromolecular refinement with _Shelxl_ ###

Although \(
for the refinement of macromolecular structures against high-resolution data (better than 2 A)
of individual standard uncertainties (Cruickshank, 1999; Paris
constraints for atoms on special positions, inclusion of anomalous scattering and refinement against twinned data that are
The application of _SHELXL_ to macromolecular refinement has been reviewed in detail by She
refinement (Konnert, 1976), the free 
remement, there are also features missing that would be desirable for macromolecules, such as a way
restraints, **TLS** restraints or constraints for anisotropic refinement and a more sophisticated
and side-chain torsion angles could be used for verification purposes, _e.g.
shows, especially for refinements against twinned data at resolutions that normally would be regarded as low for
planarity has to be imposed by a weak planarity restraint rather than a torsion-angle restraint
peptide (Stenkamp, 2005), illustrating a drawback of torsion
* [120] George M. Sheldrick * A short history of
**Figure Captions**

Fig. 1. The \(\pi^
code' and so are very compatible; the original \(SHELX\)-
compiles and runs without any changes being required. All the \(SHELX\
number of input and output files. For example, all the programs are valid for all space groups
and on an arbitrarily scale, and equispatch functions may be present. The reflections are sorted
the programs are distributed as open source and statically linked binaries for common computer systems, and require no
The input is - in view of the complexity of the calculations being performed - relatively simple
step. Further information is available from the _STELLA_ homepage at http:
The author is grateful to the Fonds der Chemschen Industrie for support and to Charles
\(\frac{\partial}{\partial t}\) is the time derivative
(Cruickshank, 1970) played in the design of 
## References ##

* Allen et al. (1974) Allen, F
(2004). _J. Appl. Cryst._**3
**117**, 1364-1366.
*
* (19) Caliandro, R., Carrozzini, B
F. R. Ahmed, S. R. Hall & C. P. Huber,
D62, 417-424.
* Debreczeni
(2003). _Acta Cryst._ D**59
* (2004) Emsley, P. & Cowtan,
* (2008) A.
**Figure Captions**

Fig. 1. The \(\pi^
## Feature articles ##

Sheldrick, G. M. & Gould, R.
423-431.
* (19) Sheldrick,
Dordrecht: Kluwer Academic Publishers.
* Sheldrick &
* (1999) Uson, I., Pohl, E.
## Abstract ##

* [122] George M. Sheldrick * A short history of
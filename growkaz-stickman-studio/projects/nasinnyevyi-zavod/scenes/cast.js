// cast.js — one outfit per recurring character. Everyone wears the MAIS-green cap.
export const CAP = '#0b8a3e';
export const FARMER = { top: 'tshirt', color: '#d64a33', head: 'cap', headColor: CAP };                  // "ти" — the grower who builds the plant
export const WORKER = { top: 'tshirt', color: '#2c2a33', head: 'cap', headColor: CAP, gloves: '#f2c21a' }; // line workers
export const LAB = { top: 'labcoat', face: 'glasses', head: 'cap', headColor: CAP };                      // lab technician
export const BREEDER = { top: 'labcoat', head: 'cap', headColor: CAP };                                   // breeder on the grow-out field
export const COURIER = { top: 'tshirt', color: '#3a6ea5', head: 'cap', headColor: CAP };
export const CAST = [FARMER, LAB, BREEDER];

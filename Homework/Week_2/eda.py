#!/usr/bin/env python
# Name: Maud van Boven
# Student number: 12474673
"""
This script does something.
"""

import csv
import numpy as np
import pandas as pd

INPUT_CSV = 'input.csv'
# OUTPUT_CSV = 'movies.csv'


def cleanup(ordered_dict, columns):
    """
    Deletes rows lacking information and removes extra spaces from data
    """

    correct_dict = ordered_dict

    for row in ordered_dict:
        for column in columns:
            row[column] = row[column].strip()
            if not row[column] or row[column] == "unknown":
                 ordered_dict.remove(row)
                 break

    # correct_rows = rows

    # for row in rows:
    #     for i in range(len(row)):
    #         row[i] = row[i].strip()
    #         # if not row[i] or row[i] == "unknown":
    #         #     rows.remove(row)
    #
    # return rows


if __name__ == "__main__":

    with open(INPUT_CSV, 'r') as infile:

        reader = csv.DictReader(infile)

        columns = ["Country", "Region", "Population", "Area (sq. mi.)",
                   "Pop. Density (per sq. mi.)", "Coastline (coast/area ratio)",
                   "Net migration", "Infant mortality (per 1000 births)",
                   "GDP ($ per capita) dollars", "Literacy (%)",
                   "Phones (per 1000)", "Arable (%)", "Crops (%)", "Other (%)",
                   "Climate", "Birthrate", "Deathrate", "Agriculture",
                   "Industry", "Service"]

        rows = []
        for dict in reader:
            row = {}
            for column in columns:
                line[column] = dict[column].strip()
            rows.append(line)

        for row in rows:
            print(line)

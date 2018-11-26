#!/usr/bin/env python
# Name: Maud van Boven
# Student number: 12474673
"""
This script loads in a CSV file and converts it to a JSON output file.
"""

import csv
import json
import numpy as np
import pandas as pd

# source: https://perso.telecom-paristech.fr/eagan/class/igr204/datasets
INPUT_CSV = 'data.csv'
OUTPUT_JSON = 'data.json'


def preprocess(df):
    """
    Preprocesses given data frame. Returns preprocessed data frame.
    """

    # group data by location, calculating each locations average numerical cols
    df = df.groupby("LOCATION").mean()

    return df


if __name__ == "__main__":

    with open(INPUT_CSV, 'r') as infile:

        # create pandas data frame from csv data in infile
        df = pd.read_csv(infile)

        infile.close()

    # preprocess data frame
    df = preprocess(df)

    # write columns of interest to json file, replacing NaN with None
    with open(OUTPUT_JSON, 'w') as outfile:
        json.dump(df[["Value"]].where((pd.notnull(df)), None)
                  .to_dict(orient='index'), outfile, indent=4)

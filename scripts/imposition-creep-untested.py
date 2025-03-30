"""
PDF Impositioning Tool

This script takes a multi-page PDF file and rearranges the pages for printing
in signatures, accounting for creep.

Dependencies:
    - PyPDF2: For PDF manipulation (install with: pip install PyPDF2)

Usage:
    python pdf_impositioning.py --input <input_pdf_path> --output <output_pdf_path> \
                                 --papersize <width>x<height> --signaturesize <num_pages> --creep <creep_amount_in_points>

Example:
    python pdf_impositioning.py --input input.pdf --output output.pdf \
                                 --papersize 11x17 --signaturesize 16 --creep 0.125
"""

import argparse
from PyPDF2 import PdfReader, PdfWriter
from PyPDF2.papersizes import LETTER, A4  # Import common paper sizes

def calculate_page_offsets(num_pages, signature_size, creep, inner_margin, is_front):
    """
    Calculates the horizontal and vertical offsets for each page in a signature,
    accounting for creep.

    Args:
        num_pages: The total number of pages in the PDF.
        signature_size: The number of pages in each signature (a single printed and folded sheet).
        creep: The amount of shift (in points) to apply to each page due to paper thickness.
        inner_margin: The margin (in points) for the inside edge of the signature.
        is_front: Boolean indicating whether it's the front or back of the signature.

    Returns:
        A list of tuples, where each tuple contains the (x_offset, y_offset) for a page.
        Returns an empty list if num_pages or signature_size is invalid.
    """
    if num_pages <= 0 or signature_size <= 0:
        return []

    offsets = []
    half_signature = signature_size // 2

    for i in range(signature_size):
        if is_front:
            page_number_in_signature = i
        else:
            page_number_in_signature = signature_size - 1 - i

        # Calculate the creep adjustment.  Creep accumulates from the center
        creep_adjustment = (half_signature - 0.5 - abs(page_number_in_signature - (signature_size - 1) / 2)) * creep

        # Determine if the page is on the left or right side of the sheet
        if page_number_in_signature < half_signature:
            x_offset = inner_margin + creep_adjustment
        else:
            x_offset = inner_margin + half_signature * 2  - creep_adjustment
        y_offset = 0  # Pages are stacked vertically for now.  Could be modified for other layouts.
        offsets.append((x_offset, y_offset))
    return offsets

def impose_pdf(input_pdf_path, output_pdf_path, paper_width, paper_height, signature_size, creep):
    """
    Imposes a PDF, arranging pages for printing in signatures.

    Args:
        input_pdf_path: Path to the input PDF file.
        output_pdf_path: Path to the output PDF file.
        paper_width: Width of the paper in points.
        paper_height: Height of the paper in points.
        signature_size: The number of pages in each signature (must be a multiple of 4).
        creep: The amount of creep (in points) to apply to each page.
    """
    if signature_size % 4 != 0:
        print("Error: Signature size must be a multiple of 4.")
        return

    reader = PdfReader(input_pdf_path)
    writer = PdfWriter()
    num_pages = len(reader.pages)

    if num_pages == 0:
        print("Error: Input PDF is empty.")
        return

    # Calculate the number of signatures
    num_signatures = (num_pages + signature_size - 1) // signature_size

    # Calculate inner margin.  This is the space between the two columns of pages
    inner_margin = paper_width / 2

    for signature_index in range(num_signatures):
        # Determine the page numbers for the current signature
        first_page_in_signature = signature_index * signature_size
        last_page_in_signature = min((signature_index + 1) * signature_size - 1, num_pages - 1)

        # Create a new page for the signature.
        new_page = writer.blank_page(width=paper_width, height=paper_height)

        # Front side of the signature
        front_page_numbers = []
        back_page_numbers = []

        for i in range(signature_size):
            page_number = first_page_in_signature + i
            if page_number > last_page_in_signature:
                # Add a blank page if there aren't enough pages in the PDF
                front_page_numbers.append(None)
                back_page_numbers.append(None)
            elif i % 2 == 0:
                front_page_numbers.append(page_number)
            else:
                back_page_numbers.insert(0, page_number) #reverse order for back

        #handle front side
        page_offsets_front = calculate_page_offsets(num_pages, signature_size, creep, inner_margin, is_front=True)
        for i, page_number in enumerate(front_page_numbers):
            if page_number is not None:
                page = reader.pages[page_number]
                x_offset, y_offset = page_offsets_front[i]
                new_page.merge_page(page, translate=(x_offset, y_offset))

        # Add the back side of the signature.  This is where it gets tricky.
        new_page_back = writer.blank_page(width=paper_width, height=paper_height)
        page_offsets_back = calculate_page_offsets(num_pages, signature_size, creep, inner_margin, is_front=False)
        for i, page_number in enumerate(back_page_numbers):
            if page_number is not None:
                page = reader.pages[page_number]
                x_offset, y_offset = page_offsets_back[i]
                new_page_back.merge_page(page, translate=(x_offset, y_offset))
        writer.add_page(new_page_back)
        writer.add_page(new_page) #add front page

    # Write the imposed PDF to the output file
    with open(output_pdf_path, "wb") as outfile:
        writer.write(outfile)

    print(f"Imposed PDF saved to {output_pdf_path}")


def parse_arguments():
    """
    Parses command-line arguments.
    """
    parser = argparse.ArgumentParser(description="Impose PDF for printing in signatures with creep adjustment.")
    parser.add_argument("--input", required=True, help="Path to the input PDF file.")
    parser.add_argument("--output", required=True, help="Path to the output PDF file.")
    parser.add_argument("--papersize", required=True, help="Paper size in inches (e.g., 11x17 or 8.5x11).")
    parser.add_argument("--signaturesize", type=int, required=True, help="Number of pages per signature (e.g., 16). Must be a multiple of 4.")
    parser.add_argument("--creep", type=float, required=True, help="Creep amount in points (e.g., 0.125).")

    args = parser.parse_args()

    # Validate paper size format
    try:
        width, height = map(float, args.papersize.split("x"))
    except ValueError:
        print("Error: Invalid paper size format. Use <width>x<height> (e.g., 11x17).")
        exit(1)

    # Convert paper size from inches to points (1 inch = 72 points)
    paper_width = width * 72
    paper_height = height * 72

    return args.input, args.output, paper_width, paper_height, args.signaturesize, args.creep



def main():
    """
    Main function to run the PDF impositioning process.
    """
    input_pdf_path, output_pdf_path, paper_width, paper_height, signature_size, creep = parse_arguments()
    impose_pdf(input_pdf_path, output_pdf_path, paper_width, paper_height, signature_size, creep)


if __name__ == "__main__":
    main()


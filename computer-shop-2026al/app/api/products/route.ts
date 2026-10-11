import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "../../../lib/products/repository";
import type { ProductType } from "../../../lib/products/types";

const productTypes: ProductType[] = [
  "cpu",
  "gpu",
  "ram",
  "disk",
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const type = searchParams.get("type");
  const sort = searchParams.get("sort") ?? "name";

  if (type && !productTypes.includes(type as ProductType)) {
    return NextResponse.json(
      { error: "Nieprawidłowa kategoria produktu." },
      { status: 400 }
    );
  }

  if (sort !== "name" && sort !== "date") {
    return NextResponse.json(
      { error: "Nieprawidłowy sposób sortowania." },
      { status: 400 }
    );
  }

  let products = await getProducts(sort);

  if (type) {
    products = products.filter(
      (product) => product.type === type
    );
  }

  return NextResponse.json(products);
}